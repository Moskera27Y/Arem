// AREM WORLD — Phase 4 redesign verification.
// Checks the redesigned homepage structure (announcement, centered nav with
// icons, hero, circular categories, stories, products carousel, trust,
// instagram, dark newsletter + footer), link integrity, language switcher,
// responsive overflow, and zero console errors.

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
  cdp.on("Runtime.exceptionThrown", (p) =>
    errors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text),
  );
  cdp.on("Log.entryAdded", (p) => {
    if (p.entry?.level === "error") errors.push(p.entry.text);
  });
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

try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }

  for (const [locale, lingo] of [["en", "English"], ["es", "Spanish"]]) {
    const { cdp, id, errors } = await openTab(`${BASE}/${locale}/`);
    await evalJs(cdp, "window.scrollTo(0, document.body.scrollHeight)");
    await sleep(800);

    const announce = await evalJs(cdp, "document.querySelectorAll('.announce__item').length");
    const announceText = (await evalJs(cdp, "document.querySelector('.announce')?.innerText ?? ''")) ?? "";
    const navLinks = await evalJs(cdp, "document.querySelectorAll('.nav-link').length");
    // Header icon actions (search / account / wishlist / cart) — locale-agnostic.
    const iconCount = await evalJs(cdp, "document.querySelectorAll('.header-actions .icon-btn').length");
    const hasUserIcon = await evalJs(cdp, "document.querySelector('.header-actions .icon-btn svg') !== null");
    const langBtns = await evalJs(cdp, "document.querySelectorAll('.lang-switch__btn').length");
    const hero = await evalJs(cdp, "document.querySelector('.hero__title') !== null");
    const heroCtas = await evalJs(cdp, "document.querySelectorAll('.hero__actions a').length");
    const catChips = await evalJs(cdp, "document.querySelectorAll('.cat-chip').length");
    const storiesIntro = await evalJs(cdp, "document.querySelector('.stories-inspire__intro') !== null");
    const storyCards = await evalJs(cdp, "document.querySelectorAll('.story-hero-card').length");
    const productCards = await evalJs(cdp, "document.querySelectorAll('.products-row .product-card').length");
    const trustItems = await evalJs(cdp, "document.querySelectorAll('.trust-item').length");
    const instaTiles = await evalJs(cdp, "document.querySelectorAll('.insta-tile').length");
    const newsletter = await evalJs(cdp, "document.querySelector('.newsletter') !== null");
    const newsletterForm = await evalJs(cdp, "document.querySelector('.newsletter-form input') !== null");
    const footer = await evalJs(cdp, "document.querySelector('.footer') !== null");
    const footerSignoff = await evalJs(cdp, "document.querySelector('.footer__signoff') !== null");
    const footerSocials = await evalJs(cdp, "document.querySelectorAll('.footer__social').length");
    const weird404 = errors.filter((e) => e.toLowerCase().includes("404")).length;

    log(announce >= 2, `${locale} announcement items`, `${announce}`);
    log(announceText.length > 20, `${locale} announcement text`);
    log(navLinks >= 6, `${locale} centered nav links`, `${navLinks}`);
    log(iconCount >= 4 && hasUserIcon, `${locale} header icons (search/account/wishlist/cart)`, `${iconCount}`);
    log(langBtns === 2, `${locale} language switcher present`, `${langBtns}`);
    log(hero, `${locale} hero present`);
    log(heroCtas >= 2, `${locale} hero CTAs`, `${heroCtas}`);
    log(catChips >= 6, `${locale} circular categories`, `${catChips}`);
    log(storiesIntro && storyCards >= 3, `${locale} stories-that-inspire`, `cards=${storyCards}`);
    log(productCards >= 5, `${locale} featured product cards`, `${productCards}`);
    log(trustItems === 5, `${locale} why-shop trust items`, `${trustItems}`);
    log(instaTiles >= 6, `${locale} instagram tiles`, `${instaTiles}`);
    log(newsletter && newsletterForm, `${locale} newsletter (dark) + form`);
    log(footer && footerSignoff && footerSocials > 0, `${locale} footer + socials`, `socials=${footerSocials}`);
    log(errors.length === 0, `${locale} no console errors`, errors.slice(0, 2).join("; "));

    // Category chip links
    const chipHrefs = await evalJs(cdp, "[...document.querySelectorAll('.cat-chip')].map(a => a.getAttribute('href'))");
    log(chipHrefs.every((h) => h.startsWith(`/${locale}/shop?category=`)), `${locale} category links localized`, chipHrefs[0]);
    // Product card links
    const prodHref = await evalJs(cdp, "document.querySelector('.products-row .product-card a')?.getAttribute('href') ?? ''");
    log(prodHref.startsWith(`/${locale}/products/`), `${locale} product links localized`, prodHref);

    // Responsive overflow
    for (const width of [360, 768, 1280]) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await sleep(400);
      const overflowX = await evalJs(cdp, "document.documentElement.scrollWidth > window.innerWidth");
      const heroVisible = await evalJs(cdp, "document.querySelector('.hero') !== null");
      log(!overflowX && heroVisible, `${locale} no horizontal overflow @${width}px`, `overflow=${overflowX}`);
    }

    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}

console.log(failures === 0 ? "\nredesign verification: ALL OK" : `\nredesign verification: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
