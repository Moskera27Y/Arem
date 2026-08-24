// AREM WORLD — Phase 5 verification: media management + product gallery.
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const listeners = [];
    ws.onopen = () =>
      resolve({
        ws,
        send(method, params = {}) {
          return new Promise((res, rej) => {
            const msgId = ++id;
            pending.set(msgId, { res, rej });
            ws.send(JSON.stringify({ id: msgId, method, params }));
          });
        },
        on(event, fn) {
          listeners.push([event, fn]);
        },
      });
    ws.onerror = (e) => reject(new Error(`WS error: ${e.message ?? "connect failed"}`));
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
      } else if (msg.method) {
        for (const [event, fn] of listeners) if (event === msg.method) fn(msg.params);
      }
    };
  });
}
let failures = 0;
const log = (ok, label, extra = "") => {
  if (!ok) failures++;
  console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? ` :: ${extra}` : ""}`);
};
async function openTab(url) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await res.json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.enable");
  const errors = [];
  cdp.on("Runtime.exceptionThrown", (p) => errors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text));
  cdp.on("Log.entryAdded", (p) => { if (p.entry?.level === "error") errors.push(p.entry.text); });
  for (let i = 0; i < 60; i++) {
    const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    if (result.value === "complete") break;
    await sleep(200);
  }
  await sleep(1200);
  return { cdp, id: target.id, errors };
}
const evalJs = async (cdp, expression) => {
  const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
  if (r.exceptionDetails) return `EXC: ${r.exceptionDetails.text}`;
  return r.result?.value;
};
const clickByText = (cdp, sel, text) =>
  evalJs(cdp, `(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(x => x.textContent.trim() === ${JSON.stringify(text)}); if (!el) return false; el.click(); return true; })()`);

try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }

  /* ------------------- Media library grid + search ------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/media`);
    const total = await evalJs(cdp, "document.querySelectorAll('.media-card').length");
    const heroCount = await evalJs(cdp, "document.querySelectorAll('.media-card__type').length");
    log(total >= 45, "media grid populated", `${total} assets`);
    const search = "mochila";
    await evalJs(cdp, `(() => { const el = document.querySelector('input[placeholder="Search media…"]'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(el, ${JSON.stringify(search)}); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
    await sleep(300);
    const searched = await evalJs(cdp, "document.querySelectorAll('.media-card').length");
    log(searched >= 1 && searched < total, "media search filters", `${searched}`);
    // Filter by type Hero (clear search first so filters are independent)
    await evalJs(cdp, `(() => { const el = document.querySelector('input[placeholder="Search media…"]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(el, ''); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
    await sleep(300);
    await evalJs(cdp, `(() => { const el = [...document.querySelectorAll('.admin-toolbar select')][0]; const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; setter.call(el, 'hero'); el.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
    await sleep(400);
    const heroAssets = await evalJs(cdp, "document.querySelectorAll('.media-card').length");
    const heroType = await evalJs(cdp, "[...document.querySelectorAll('.media-card__type')].map(t => t.textContent.trim())");
    log(heroAssets === 1 && heroType[0] === "Hero", "media filter by type (Hero)", `count=${heroAssets} type=${heroType[0]}/${JSON.stringify(heroType)}`);
    log(errors.length === 0, "media grid no console errors", errors.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  /* ------------------- Replace hero image -> storefront ------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/media`);
    // click the Hero card
    await evalJs(cdp, "(() => { const b = [...document.querySelectorAll('.media-card')].find(c => c.innerText.includes('Hero')); if (!b) return false; b.click(); return true; })()");
    await sleep(400);
    const modalOpen = await evalJs(cdp, "document.querySelector('.admin-modal') !== null");
    const setUrl = await evalJs(cdp, `(() => { const el = document.querySelector('input[list="arem-media-placeholders"]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(el, '/images/brand-1.svg'); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
    await sleep(200);
    // first Save -> shows confirm state
    await clickByText(cdp, ".admin-modal__actions button", "Save");
    await sleep(300);
    const confirmShown = await evalJs(cdp, "[...document.querySelectorAll('.admin-modal__actions button')].some(b => b.textContent.trim().includes('Confirm'))");
    await clickByText(cdp, ".admin-modal__actions button", "Confirm replace");
    await sleep(600);
    const modalGone = await evalJs(cdp, "document.querySelector('.admin-modal') === null");
    log(modalOpen && setUrl && confirmShown && modalGone, "media replace hero (confirm flow)", `modal=${modalOpen} confirm=${confirmShown} saved=${modalGone}`);
    log(errors.length === 0, "media replace no console errors", errors.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    // Storefront: home hero uses the replaced src
    const { cdp: cdp2, id: id2, errors: err2 } = await openTab(`${BASE}/en/`);
    await cdp2.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(1600);
    const heroSrc = await evalJs(cdp2, "document.querySelector('.hero__media img')?.getAttribute('src') ?? ''");
    const footerBg = await evalJs(cdp2, "document.querySelector('.footer__bg')?.style.backgroundImage ?? ''");
    log(heroSrc.includes("brand-1"), "storefront hero image updated after replace", heroSrc);
    log(footerBg.includes("brand-1"), "storefront footer background uses media asset", footerBg.slice(0, 40));
    log(err2.length === 0, "storefront home no console errors", err2.slice(0, 2).join("; "));

    // Persistence after reload
    await evalJs(cdp2, "location.reload()");
    await sleep(1600);
    const heroSrc2 = await evalJs(cdp2, "document.querySelector('.hero__media img')?.getAttribute('src') ?? ''");
    log(heroSrc2.includes("brand-1"), "hero image persists after reload", heroSrc2);

    // Language switch -> hero still replaced (localized alt)
    await evalJs(cdp2, "(() => { const b = [...document.querySelectorAll('.lang-switch__btn')].find(x => x.textContent.trim() === 'ES'); b?.click(); return true; })()");
    await sleep(1500);
    const esHeroSrc = await evalJs(cdp2, "document.querySelector('.hero__media img')?.getAttribute('src') ?? ''");
    const esLang = await evalJs(cdp2, "document.documentElement.lang");
    log(esHeroSrc.includes("brand-1") && esLang === "es", "hero media survives EN->ES switch", `src=${esHeroSrc.slice(-20)} lang=${esLang}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }

  /* ------------------- Category image -> storefront ----------------- */
  {
    const { cdp, id } = await openTab(`${BASE}/admin/media`);
    // Filter to a category asset (Coffee) and replace its image
    await evalJs(cdp, "(() => { const b = [...document.querySelectorAll('.media-card')].find(c => c.innerText.includes('Category · Coffee')); if (!b) return false; b.click(); return true; })()");
    await sleep(400);
    await evalJs(cdp, `(() => { const el = document.querySelector('input[list="arem-media-placeholders"]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(el, '/images/cat-ceramics.svg'); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
    await sleep(200);
    await clickByText(cdp, ".admin-modal__actions button", "Save");
    await sleep(300);
    await clickByText(cdp, ".admin-modal__actions button", "Confirm replace");
    await sleep(600);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    const { cdp: cdp2, id: id2 } = await openTab(`${BASE}/en/`);
    await sleep(1800);
    const cats = await evalJs(cdp2, "[...document.querySelectorAll('.cat-chip img')].map(i => i.getAttribute('src'))");
    const coffeeUsesCeramics = cats.some((s) => s.includes("cat-ceramics"));
    // coffee is the first chip; verify at least one category chip shows cat-ceramics
    log(coffeeUsesCeramics, "category image updated on storefront", cats.join(", ").slice(0, 120));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }

  /* ------------------- Product image -> card + gallery -------------- */
  {
    const { cdp, id } = await openTab(`${BASE}/admin/media`);
    await evalJs(cdp, "(() => { const b = [...document.querySelectorAll('.media-card')].find(c => c.innerText.includes('Product ·') && c.innerText.includes('image 2')); if (!b) return false; b.click(); return true; })()");
    await sleep(400);
    // replace the product's image-2 (an image that appears in the PDP gallery)
    await evalJs(cdp, `(() => { const el = document.querySelector('input[list="arem-media-placeholders"]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(el, '/images/hero-craft.svg'); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
    await sleep(200);
    await clickByText(cdp, ".admin-modal__actions button", "Save");
    await sleep(300);
    await clickByText(cdp, ".admin-modal__actions button", "Confirm replace");
    await sleep(600);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    // Gallery test on a product with 2 images
    const { cdp: cdp2, id: id2, errors: err2 } = await openTab(`${BASE}/en/products/wayuu-mochila-katsu`);
    await cdp2.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(1800);
    const thumbs = await evalJs(cdp2, "document.querySelectorAll('.gallery__thumb').length");
    const main1 = await evalJs(cdp2, "document.querySelector('.gallery__main-img')?.getAttribute('src') ?? ''");
    const counter = await evalJs(cdp2, "document.querySelector('.gallery__counter')?.textContent.trim()");
    const navPrev = await evalJs(cdp2, "document.querySelector('.gallery__nav--prev') !== null");
    const navNext = await evalJs(cdp2, "document.querySelector('.gallery__nav--next') !== null");
    log(thumbs >= 2, "gallery thumbnails present", `${thumbs}`);
    log(navPrev && navNext, "gallery prev/next controls present");
    log(counter === "1 / 2", "gallery counter", `${counter}`);

    // Click thumb 2 -> main changes + selected state
    const beforeSrc = main1;
    await evalJs(cdp2, "(() => { const t = document.querySelectorAll('.gallery__thumb')[1]; t?.click(); return true; })()");
    await sleep(700);
    const main2 = await evalJs(cdp2, "document.querySelector('.gallery__main-img')?.getAttribute('src') ?? ''");
    const activeThumb = await evalJs(cdp2, "document.querySelectorAll('.gallery__thumb')[1]?.getAttribute('data-active')");
    const counter2 = await evalJs(cdp2, "document.querySelector('.gallery__counter')?.textContent.trim()");
    log(main2 !== beforeSrc && activeThumb === "true" && counter2 === "2 / 2", "thumb click switches image + selected state", `${main2.slice(-24)} active=${activeThumb} ${counter2}`);

    // Keyboard arrow
    await cdp2.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowLeft", code: "ArrowLeft" });
    await cdp2.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowLeft", code: "ArrowLeft" });
    await sleep(500);
    const counter3 = await evalJs(cdp2, "document.querySelector('.gallery__counter')?.textContent.trim()");
    log(counter3 === "1 / 2", "gallery keyboard arrow cycles", `${counter3}`);

    // Next button
    await evalJs(cdp2, "(() => { const b = document.querySelector('.gallery__nav--next'); b?.click(); return true; })()");
    await sleep(500);
    const counter4 = await evalJs(cdp2, "document.querySelector('.gallery__counter')?.textContent.trim()");
    log(counter4 === "2 / 2", "gallery next button", `${counter4}`);

    // Crossfade present (animation class)
    const anim = await evalJs(cdp2, "getComputedStyle(document.querySelector('.gallery__main-img')).animationName");
    log(anim === "gallery-fade", "gallery crossfade animation", `${anim}`);

    // No layout shift: main has fixed aspect ratio
    const ratio = await evalJs(cdp2, "getComputedStyle(document.querySelector('.gallery__main')).aspectRatio");
    log(ratio !== "auto", "gallery fixed aspect-ratio (no layout shift)", `${ratio}`);

    log(err2.length === 0, "gallery no console errors", err2.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}

console.log(failures === 0 ? "\nphase 5 verification: ALL OK" : `\nphase 5 verification: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
