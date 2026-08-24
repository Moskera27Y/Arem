// Phase 6 end-to-end media flow: real admin login, persistent media grid,
// hero replace via modal UI, storefront /en + /es reflection, product image
// replace -> PDP gallery reflection, then reset to defaults.
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result?.value;
};
const setInput = (cdp, selector, value) =>
  evalJs(cdp, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
const clickText = (cdp, text) =>
  evalJs(cdp, `(() => { const el = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === ${JSON.stringify(text)}); if (!el) return false; el.click(); return true; })()`);

try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }

  // 1) Real login through the form
  const login = await openTab(`${BASE}/login`);
  await setInput(login.cdp, "#admin-email", process.env.ADMIN_EMAIL);
  await setInput(login.cdp, "#admin-password", process.env.ADMIN_PASSWORD);
  await clickText(login.cdp, "Entrar");
  await sleep(1800);
  const afterLogin = await evalJs(login.cdp, "location.pathname");
  log(afterLogin === "/admin", "login form -> /admin", `path=${afterLogin}`);
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${login.id}`); } catch {}
  try { login.cdp.ws.close(); } catch {}

  // 2) Media grid populated (persistent DB)
  const media = await openTab(`${BASE}/admin/media`);
  await sleep(1200);
  const cardCount = await evalJs(media.cdp, "document.querySelectorAll('.media-card').length");
  log(cardCount >= 10, "admin media grid populated", `cards=${cardCount}`);
  const heroName = await evalJs(media.cdp, "[...document.querySelectorAll('.media-card')].find(c => c.querySelector('img')?.getAttribute('src')?.includes('hero-main'))?.querySelector('.media-card__name')?.innerText ?? 'NO'");
  log(heroName.toUpperCase().includes("HERO"), "hero card present", heroName);

  // 3) Replace hero via the modal UI (confirm-replace flow)
  const openHeroCard = await evalJs(media.cdp, `(() => { const c = [...document.querySelectorAll('.media-card')].find(x => x.querySelector('img')?.getAttribute('src')?.includes('hero-main')); if (!c) return false; c.click(); return true; })()`);
  await sleep(600);
  const modalOpen = await evalJs(media.cdp, "document.querySelector('.admin-modal') !== null");
  log(openHeroCard && modalOpen, "hero edit modal opens", `open=${openHeroCard} modal=${modalOpen}`);
  const urlSet = await setInput(media.cdp, 'input[list="arem-media-placeholders"]', "/images/brand-1.svg");
  await sleep(200);
  await clickText(media.cdp, "Guardar");
  await sleep(400);
  const confirmBtn = await evalJs(media.cdp, "document.querySelector('.admin-modal__actions .btn--primary')?.innerText ?? 'NO'");
  log(confirmBtn.toLowerCase().includes("confirmar"), "replace asks for confirmation", confirmBtn);
  await clickText(media.cdp, "Confirmar reemplazo");
  await sleep(1200);
  const savedStatus = await evalJs(media.cdp, "document.querySelector('.form-status')?.innerText ?? ''");
  log(savedStatus.includes("guardada"), "hero saved via modal", savedStatus.slice(0, 60));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${media.id}`); } catch {}
  try { media.cdp.ws.close(); } catch {}

  // 4) Storefront /en and /es reflect the new hero
  for (const loc of ["en", "es"]) {
    const t = await openTab(`${BASE}/${loc}/`);
    await sleep(1500);
    const src = await evalJs(t.cdp, "document.querySelector('.hero__media img')?.getAttribute('src') ?? 'NO'");
    log(src.includes("brand-1"), `hero persists on /${loc}`, src.slice(-40));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // 5) Product image replace -> PDP gallery reflects
  const prod = await openTab(`${BASE}/admin/media`);
  await sleep(1200);
  const openProdCard = await evalJs(prod.cdp, `(() => { const c = [...document.querySelectorAll('.media-card')].find(x => x.querySelector('img')?.getAttribute('src')?.includes('p-mochila-katsu-1')); if (!c) return false; c.click(); return true; })()`);
  await sleep(600);
  await setInput(prod.cdp, 'input[list="arem-media-placeholders"]', "/images/brand-1.svg");
  await sleep(200);
  await clickText(prod.cdp, "Guardar");
  await sleep(400);
  await clickText(prod.cdp, "Confirmar reemplazo");
  await sleep(1200);
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${prod.id}`); } catch {}
  try { prod.cdp.ws.close(); } catch {}

  const pdp = await openTab(`${BASE}/en/products/wayuu-mochila-katsu`);
  await sleep(1800);
  const galleryImgs = await evalJs(pdp.cdp, "[...document.querySelectorAll('.gallery img, .gallery__thumb img')].map(i => i.getAttribute('src'))");
  log(galleryImgs.length >= 2, "PDP gallery present", `imgs=${galleryImgs.length}`);
  log(galleryImgs.some((s) => s.includes("brand-1")), "PDP gallery reflects replaced product image", galleryImgs.slice(0, 2).join(",").slice(-80));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${pdp.id}`); } catch {}
  try { pdp.cdp.ws.close(); } catch {}

  // 6) Reset hero + product image back to defaults via admin API
  const lr = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  });
  const cookie = lr.headers.get("set-cookie")?.split(";")[0] ?? "";
  const resets = [
    ["/images/hero-main.svg", "/images/hero-main.svg", "hero", "Hero · Homepage"],
    ["/images/p-mochila-katsu-1.svg", "/images/p-mochila-katsu-1.svg", "product", 'Product · Wayuu Mochila "Katsü" · image 1'],
  ];
  for (const [key, url, type, usage] of resets) {
    const res = await fetch(`${BASE}/api/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ key, url, type, usage }),
    });
    log(res.status === 200, `reset ${key}`, `status=${res.status}`);
  }

  // 7) Verify storefront back to defaults
  const last = await openTab(`${BASE}/en/`);
  await sleep(1500);
  const heroAgain = await evalJs(last.cdp, "document.querySelector('.hero__media img')?.getAttribute('src') ?? 'NO'");
  log(heroAgain.includes("hero-main"), "storefront hero back to default", heroAgain.slice(-40));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${last.id}`); } catch {}
  try { last.cdp.ws.close(); } catch {}
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}
console.log(failures === 0 ? "\nphase6 media flow: ALL OK" : `\nphase6 media flow: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
