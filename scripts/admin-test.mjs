// AREM WORLD — Admin panel end-to-end test (Phase 3).
// Covers: overview, product create/edit/delete + validation + persistence,
// category create, promotion storefront reflection (price badge,
// announcement, free shipping), social-link storefront reflection, admin
// responsive behavior, and zero console errors.
// Usage: node scripts/admin-test.mjs [baseUrl]

import { spawn, execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
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
  await sleep(1000);
  return { cdp, id: target.id, errors };
}

async function evalJs(cdp, expression) {
  const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result?.value;
}

const setInput = (cdp, selector, value) =>
  evalJs(cdp, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);

const setTextarea = (cdp, selector, value) =>
  evalJs(cdp, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);

const click = (cdp, selector) =>
  evalJs(cdp, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);

const clickByText = (cdp, selector, text) =>
  evalJs(cdp, `(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(x => x.textContent.trim() === ${JSON.stringify(text)}); if (!el) return false; el.click(); return true; })()`);

const sleepAnd = async (ms) => {
  await sleep(ms);
};

try {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    await sleep(300);
  }

  /* ------------------------- Overview page ------------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin`);
    const navItems = await evalJs(cdp, "[...document.querySelectorAll('.admin-nav__link')].map(a => a.textContent.trim())");
    const statLabels = await evalJs(cdp, "[...document.querySelectorAll('.admin-stat__label')].map(s => s.textContent.trim())");
    const statValues = await evalJs(cdp, "[...document.querySelectorAll('.admin-stat__value')].map(s => s.textContent.trim())");
    log(
      navItems.some((n) => n.includes("Overview")) &&
        navItems.some((n) => n.includes("Products")) &&
        navItems.some((n) => n.includes("Categories")) &&
        navItems.some((n) => n.includes("Promotions")) &&
        navItems.some((n) => n.includes("Social links")) &&
        navItems.some((n) => n.includes("View storefront")),
      "admin overview nav",
      navItems.join(" | "),
    );
    log(
      statLabels.includes("Total products") &&
        statLabels.includes("Published products") &&
        statLabels.includes("Active promotions") &&
        Number(statValues[0]) >= 12,
      "admin overview stats",
      statValues.join(" / "),
    );
    const recentOk = (await evalJs(cdp, "document.querySelectorAll('.recent-item').length")) >= 5;
    log(recentOk, "admin overview recent products");
    log(errors.length === 0, "admin overview no console errors", errors.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  /* ------------------------ Product create ------------------------- */
  let productId = "";
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/products/new`);
    // Validation: save empty -> inline errors
    await clickByText(cdp, "button", "Save product");
    await sleepAnd(300);
    const errorFields = await evalJs(cdp, "document.querySelectorAll('.field__error').length");
    log(errorFields >= 3, "product form validation (empty submit)", `errors=${errorFields}`);

    await setInput(cdp, 'input[placeholder="e.g. Wayuu Mochila"]', "Test Mochila Nueva");
    // Spanish name is the sibling grid field
    const esInputs = await evalJs(cdp, "[...document.querySelectorAll('input')].filter(i => i.placeholder && i.placeholder.includes('Wayuu Mochila')).length");
    // Set the ES name: second field in the first BiFields grid
    const esSet = await evalJs(cdp, `(() => { const grid = document.querySelector('.admin-form__grid'); const inputs = [...grid.querySelectorAll('input')].filter(i => i.type === 'text'); if (inputs.length < 2) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(inputs[1], 'Mochila Nueva de Prueba'); inputs[1].dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    // Price + SKU + inventory
    await setInput(cdp, 'input[placeholder="320000"]', "250000");
    await setInput(cdp, 'input[placeholder="MCH-KAT-001"]', "TEST-SKU-001");
    const invInputs = await evalJs(cdp, "[...document.querySelectorAll('input[type=number]')].map(i => i.placeholder || i.value)");
    const invSet = await evalJs(cdp, `(() => { const inputs = [...document.querySelectorAll('input[type=number]')]; const el = inputs[inputs.length - 1]; if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, '7'); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    // Publish the product (status select → Published)
    const published = await evalJs(cdp, `(() => { const sel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent === 'Published')); if (!sel) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set; setter.call(sel, 'published'); sel.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    await clickByText(cdp, "button", "Save product");
    await sleepAnd(1200);

    const onList = await evalJs(cdp, "location.pathname");
    const listHas = await evalJs(cdp, "document.body.innerText.includes('Test Mochila Nueva')");
    log(onList === "/admin/products" && listHas, "product create saved & listed", `path=${onList}`);
    log(errors.length === 0, "product create no console errors", errors.join("; ").slice(0, 200));

    // Edit link: grab the id from the edit href of the new row
    productId = await evalJs(
      cdp,
      `(() => { const row = [...document.querySelectorAll('tr')].find(tr => tr.innerText.includes('Test Mochila Nueva')); if (!row) return ''; const a = row.querySelector('a[href*="/admin/products/"]'); return a ? a.getAttribute('href').split('/').pop() : ''; })()`,
    );
    log(productId.length > 0, "product edit route id found", productId);

    // Persistence: reload the products page and confirm the product is still there
    await evalJs(cdp, "location.reload()");
    await sleepAnd(1500);
    const afterReload = await evalJs(cdp, "document.body.innerText.includes('Test Mochila Nueva')");
    log(afterReload, "product persists after reload (localStorage)");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  /* --------------------- Product edit (rename) ---------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/products/${productId}`);
    const editInput = await evalJs(cdp, `(() => { const el = document.querySelector('input[placeholder="e.g. Wayuu Mochila"]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, 'Mochila Renombrada'); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    await clickByText(cdp, "button", "Save product");
    await sleepAnd(1200);
    const renamed = await evalJs(cdp, "document.body.innerText.includes('Mochila Renombrada')");
    log(editInput && renamed, "product edit saves rename", `renamed=${renamed}`);
    log(errors.length === 0, "product edit no console errors", errors.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  /* --------------------- Storefront reflects product ------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/en/shop`);
    await sleepAnd(1500); // allow admin store hydration
    const text = await evalJs(cdp, "document.body.innerText");
    const titles = await evalJs(cdp, "[...document.querySelectorAll('.product-card__title')].map(t => t.innerText)");
    const storeInfo = await evalJs(cdp, `(() => { const raw = localStorage.getItem('arem.admin.v1'); if (!raw) return 'NO STORAGE'; const s = JSON.parse(raw).state; return JSON.stringify({ n: s.products.length, active: s.products.filter(p => p.status === 'active').length, hasRenamed: s.products.some(p => p.name.en === 'Mochila Renombrada') }); })()`);
    log(text.includes("Mochila Renombrada"), "storefront shop shows admin-created/renamed product", `titles=${JSON.stringify(titles).slice(0, 220)} store=${storeInfo}`);
    // Open its PDP via URL slug
    const slug = "mochila-renombrada";
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    const { cdp: cdp2, id: id2, errors: err2 } = await openTab(`${BASE}/en/products/${slug}`);
    await sleepAnd(1500);
    const pdpText = await evalJs(cdp2, "document.body.innerText");
    const pdpOk = pdpText.includes("Mochila Renombrada") && pdpText.includes("TEST-SKU-001");
    log(pdpOk, "storefront PDP renders admin-created product", `pdp=${pdpOk}`);
    log(err2.length === 0, "PDP no console errors", err2.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }

  /* --------------------------- Category create ----------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/categories`);
    await clickByText(cdp, "button", "Add category");
    await sleepAnd(300);
    await setInput(cdp, 'input[placeholder="e.g. Textiles"]', "Test Category");
    const esSet = await evalJs(cdp, `(() => { const grid = document.querySelector('.admin-form__grid'); const inputs = [...grid.querySelectorAll('input')].filter(i => i.type === 'text'); if (inputs.length < 2) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(inputs[1], 'Categoría de Prueba'); inputs[1].dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    await clickByText(cdp, "button", "Save category");
    await sleepAnd(800);
    const listed = await evalJs(cdp, "document.body.innerText.includes('Test Category')");
    log(listed, "category create saves & lists");
    log(errors.length === 0, "category create no console errors", errors.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  /* --------------------- Storefront reflects category ---------------- */
  {
    const { cdp, id } = await openTab(`${BASE}/en/shop`);
    await sleepAnd(1500);
    const filterText = await evalJs(cdp, "document.querySelector('.filters')?.innerText ?? ''");
    log(filterText.includes("Test Category"), "storefront shop filter shows new category");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  /* ------------------------- Promotion flows ------------------------- */
  {
    // Create an active 20% promotion on the renamed product
    const { cdp, id, errors } = await openTab(`${BASE}/admin/promotions`);
    await clickByText(cdp, "button", "Create promotion");
    await sleepAnd(300);
    await setInput(cdp, 'input[placeholder="e.g. August coffee sale"]', "Test Percent Promo");
    // value field defaults to "10" -> set 20
    const valueSet = await evalJs(cdp, `(() => { const el = [...document.querySelectorAll('input[type=number]')].find(i => !i.disabled); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, '20'); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    // Select the renamed product in the product target list
    const targetSet = await evalJs(cdp, `(() => { const labels = [...document.querySelectorAll('label')]; const l = labels.find(x => x.innerText.trim().includes('Mochila Renombrada')); if (!l) return false; const cb = l.querySelector('input[type=checkbox]'); if (!cb) return false; cb.click(); return true; })()`);
    await sleepAnd(150);
    await clickByText(cdp, "button", "Save promotion");
    await sleepAnd(800);
    const promoListed = await evalJs(cdp, "document.body.innerText.includes('Test Percent Promo')");
    const promoActive = await evalJs(cdp, "document.body.innerText.includes('Active')");
    log(valueSet && targetSet && promoListed && promoActive, "promotion create (20%, active)", `listed=${promoListed} activeChip=${promoActive}`);
    log(errors.length === 0, "promotion create no console errors", errors.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    // Storefront: product card shows discounted price + -20% badge
    const { cdp: cdp2, id: id2, errors: err2 } = await openTab(`${BASE}/en/products/mochila-renombrada`);
    await sleepAnd(1500);
    const pdpText = await evalJs(cdp2, "document.body.innerText");
    const hasBadge = await evalJs(cdp2, "document.querySelector('.pdp__price .badge--sale') !== null");
    // price 250000 * 0.8 = 200000; formatted es-CO "$ 200.000"
    log(hasBadge && pdpText.includes("200.000"), "storefront PDP shows promotion discount + badge", `badge=${hasBadge}`);
    log(err2.length === 0, "promotion PDP no console errors", err2.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }

  /* ----------------------- Social link flow -------------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/social-links`);
    // Deactivate Facebook
    const fbRow = await evalJs(cdp, `(() => { const rows = [...document.querySelectorAll('tr')]; const row = rows.find(r => r.innerText.includes('Facebook')); if (!row) return false; const edit = row.querySelector('button[aria-label*="Edit"]'); if (!edit) return false; edit.click(); return true; })()`);
    await sleepAnd(400);
    const deactivate = await evalJs(cdp, `(() => { const cb = [...document.querySelectorAll('input[type=checkbox]')].find(c => c.checked); if (!cb) return false; cb.click(); return true; })()`);
    await sleepAnd(150);
    await clickByText(cdp, "button", "Save link");
    await sleepAnd(600);
    log(fbRow && deactivate, "social link edit (deactivate facebook)");
    log(errors.length === 0, "social link edit no console errors", errors.join("; ").slice(0, 200));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    // Storefront footer no longer shows Facebook
    const { cdp: cdp2, id: id2 } = await openTab(`${BASE}/en/about`);
    await sleepAnd(1500);
    const footerSocials = await evalJs(cdp2, "document.querySelector('.footer__socials')?.innerText ?? ''");
    log(!footerSocials.includes("Facebook") && footerSocials.includes("Instagram"), "storefront footer reflects social-link deactivation", footerSocials.replace(/\n/g, " ").slice(0, 120));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }

  /* ----------------------- Announcement & free shipping --------------- */
  {
    // Announcement promotion
    const { cdp, id } = await openTab(`${BASE}/admin/promotions`);
    await clickByText(cdp, "button", "Create promotion");
    await sleepAnd(300);
    await setInput(cdp, 'input[placeholder="e.g. August coffee sale"]', "Test Announcement");
    const typeSet = await evalJs(cdp, `(() => { const sel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent === 'Announcement')); if (!sel) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set; setter.call(sel, 'announcement'); sel.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    await sleepAnd(200);
    const anText = await evalJs(cdp, `(() => { const inputs = [...document.querySelectorAll('input[type=text]')]; const el = inputs.find(i => i.placeholder && i.placeholder.includes('announcement bar')); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, 'Special announcement EN'); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleepAnd(150);
    await clickByText(cdp, "button", "Save promotion");
    await sleepAnd(700);
    log(typeSet && anText, "announcement promotion created");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}

    // Free shipping promotion (no text -> default note)
    const { cdp: cdp2, id: id2 } = await openTab(`${BASE}/admin/promotions`);
    await clickByText(cdp2, "button", "Create promotion");
    await sleepAnd(300);
    await setInput(cdp2, 'input[placeholder="e.g. August coffee sale"]', "Test Free Shipping");
    const fsType = await evalJs(cdp2, `(() => { const sel = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent === 'Free shipping')); if (!sel) return false; const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set; setter.call(sel, 'free-shipping'); sel.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    await sleepAnd(200);
    await clickByText(cdp2, "button", "Save promotion");
    await sleepAnd(700);
    log(fsType, "free-shipping promotion created");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}

    // Storefront: announcement bar shows the announcement text + free-shipping note
    const { cdp: cdp3, id: id3 } = await openTab(`${BASE}/en/`);
    await cdp3.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleepAnd(1500);
    const announceText = (await evalJs(cdp3, "document.querySelector('.announce')?.innerText ?? ''")).toLowerCase();
    log(
      announceText.includes("special announcement en") && announceText.includes("free shipping across the store"),
      "storefront announcement bar reflects promotions",
      announceText.slice(0, 160),
    );
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id3}`); } catch {}
    try { cdp3.ws.close(); } catch {}

    // Cart drawer shipping row shows "Free" (needs an item in the cart)
    const { cdp: cdp4, id: id4 } = await openTab(`${BASE}/en/products/cafe-organico-altura-quindio`);
    await sleepAnd(1200);
    await evalJs(cdp4, `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Add to cart')); if (!b) return false; b.click(); return true; })()`);
    await sleepAnd(900);
    const drawerText = await evalJs(cdp4, "document.querySelector('.drawer')?.innerText ?? ''");
    log(drawerText.includes("Free"), "cart drawer shows free shipping", drawerText.includes("Free") ? "" : drawerText.slice(0, 100));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id4}`); } catch {}
    try { cdp4.ws.close(); } catch {}
  }

  /* ------------------------ Product delete --------------------------- */
  {
    const { cdp, id, errors } = await openTab(`${BASE}/admin/products`);
    await sleepAnd(1200);
    const deleted = await evalJs(cdp, `(() => { const rows = [...document.querySelectorAll('tr')]; const row = rows.find(r => r.innerText.includes('Mochila Renombrada')); if (!row) return false; const del = row.querySelector('button[aria-label*="Delete"]'); if (!del) return false; del.click(); return true; })()`);
    await sleepAnd(500);
    const dialogOpen = await evalJs(cdp, "document.querySelector('.admin-confirm')?.dataset.open === 'true'");
    await clickByText(cdp, ".admin-confirm button", "Delete");
    await sleepAnd(800);
    const gone = !(await evalJs(cdp, "document.body.innerText.includes('Mochila Renombrada')"));
    log(deleted && dialogOpen && gone, "product delete with confirmation", `dialog=${dialogOpen} gone=${gone}`);
    log(errors.length === 0, "product delete no console errors", errors.join("; ").slice(0, 200));

    // Storefront no longer shows it
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
    const { cdp: cdp2, id: id2 } = await openTab(`${BASE}/en/shop`);
    await sleepAnd(1500);
    const shopText = await evalJs(cdp2, "document.body.innerText");
    log(!shopText.includes("Mochila Renombrada"), "storefront hides deleted product");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id2}`); } catch {}
    try { cdp2.ws.close(); } catch {}
  }

  /* --------------------- Admin responsive (mobile) ------------------- */
  {
    const { cdp, id } = await openTab(`${BASE}/admin/products`);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleepAnd(600);
    const sidebarHidden = await evalJs(cdp, "getComputedStyle(document.querySelector('.admin-sidebar')).display === 'none'");
    const menuBtn = await evalJs(cdp, "getComputedStyle(document.querySelector('.admin-menu-btn')).display !== 'none'");
    // Single-column stats + stacked table rows are the mobile layout.
    const statsCols = await evalJs(cdp, "document.querySelector('.admin-stats') ? getComputedStyle(document.querySelector('.admin-stats')).gridTemplateColumns.split(' ').length : 1");
    const tableStacked = (await evalJs(cdp, "document.querySelector('.data-table thead') ? getComputedStyle(document.querySelector('.data-table thead')).display === 'none' : true")) === true;
    const menuOpen = await evalJs(cdp, "(() => { const b = document.querySelector('.admin-menu-btn'); b?.click(); return true; })()");
    await sleepAnd(500);
    const drawer = await evalJs(cdp, "document.querySelector('.admin-drawer')?.dataset.open === 'true'");
    log(sidebarHidden && menuBtn && statsCols === 1 && tableStacked && drawer, "admin responsive at 390px", `sidebarHidden=${sidebarHidden} menuBtn=${menuBtn} statsCols=${statsCols} tableStacked=${tableStacked} drawer=${drawer}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}

console.log(failures === 0 ? "\nadmin test: ALL OK" : `\nadmin test: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
