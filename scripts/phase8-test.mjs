// Phase 8A — currency display switch (USD↔COP), persistence, cart USD-final
// note, and admin USD-only labels.
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };

function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const listeners = [];
    ws.onopen = () => res({ ws, send(method, params = {}) { return new Promise((r, j) => { const m = ++id; pending.set(m, { r, j }); ws.send(JSON.stringify({ id: m, method, params })); }); }, on(e, f) { listeners.push([e, f]); } });
    ws.onerror = (e) => rej(new Error("ws err"));
    ws.onmessage = (ev) => { const msg = JSON.parse(ev.data); if (msg.id && pending.has(msg.id)) { const { r, j } = pending.get(msg.id); pending.delete(msg.id); if (msg.error) j(new Error(msg.error.message)); else r(msg.result); } else if (msg.method) { for (const [e, f] of listeners) if (e === msg.method) f(msg.params); } };
  });
}
async function openTab(url) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await res.json(); const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable"); await cdp.send("Log.enable"); await cdp.send("Page.enable");
  const errors = [];
  cdp.on("Runtime.exceptionThrown", (p) => errors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text));
  cdp.on("Log.entryAdded", (p) => { if (p.entry?.level === "error") errors.push(p.entry.text); });
  for (let i = 0; i < 60; i++) { const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (result.value === "complete") break; await sleep(200); }
  await sleep(1400); return { cdp, id: target.id, errors };
}
const evalJs = async (cdp, expr) => { const r = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result?.value; };
const setInput = (cdp, sel, v) => evalJs(cdp, `(()=>{const el=document.querySelector(${JSON.stringify(sel)});if(!el)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);

try {
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}; await sleep(300); }

  // ---------- 1) default USD on product card ----------
  const t = await openTab(`${BASE}/en/shop`);
  await sleep(800);
  const firstPrice = await evalJs(t.cdp, "document.querySelector('.product-card__price span')?.textContent.trim() ?? 'NONE'");
  const headerSelect = await evalJs(t.cdp, "document.querySelector('.header-actions .currency-switch') !== null");
  log(headerSelect, "header currency selector present");
  log(/^\$/.test(firstPrice), "product card defaults to USD format", firstPrice);

  // ---------- 2) switch to COP ----------
  await evalJs(t.cdp, "(()=>{const sel=document.querySelector('.header-actions .currency-switch');if(!sel)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;s.call(sel,'COP');sel.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await sleep(900);
  const copPrice = await evalJs(t.cdp, "document.querySelector('.product-card__price span')?.textContent.trim() ?? 'NONE'");
  log(copPrice.startsWith("COP $"), "switching to COP converts price", copPrice);
  const guestPref = await evalJs(t.cdp, "localStorage.getItem('arem.display_currency')");
  log(guestPref === "COP", "guest currency saved to localStorage", guestPref);

  // ---------- 3) persistence across refresh ----------
  await evalJs(t.cdp, "location.reload()");
  await sleep(2000);
  const afterReload = await evalJs(t.cdp, "document.querySelector('.product-card__price span')?.textContent.trim() ?? 'NONE'");
  log(afterReload.startsWith("COP $"), "currency persists after refresh", afterReload);
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
  try { t.cdp.ws.close(); } catch {}

  // ---------- 4) PDP note when non-USD ----------
  const p = await openTab(`${BASE}/en/products/cafe-organico-altura-quindio`);
  await evalJs(p.cdp, "(()=>{const sel=document.querySelector('.header-actions .currency-switch');if(!sel)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;s.call(sel,'COP');sel.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await sleep(900);
  const note = await evalJs(p.cdp, "document.querySelector('.currency-note')?.textContent.trim() ?? ''");
  log(/Final payment is charged in USD/i.test(note), "PDP shows USD-charge note when non-USD", note.slice(0, 60));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${p.id}`); } catch {}
  try { p.cdp.ws.close(); } catch {}

  // ---------- 5) cart summary shows final USD total + note ----------
  const c = await openTab(`${BASE}/en/products/cafe-organico-altura-quindio`);
  await evalJs(c.cdp, "(()=>{const sel=document.querySelector('.header-actions .currency-switch');if(!sel)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;s.call(sel,'COP');sel.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await sleep(600);
  await evalJs(c.cdp, "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes('Add to cart'));b?.click();return true})()");
  await sleep(1000);
  await evalJs(c.cdp, "window.location.href='/en/cart'; true");
  await sleep(2000);
  const cartText = await evalJs(c.cdp, "document.body.innerText");
  log(/Final total \(USD\)/.test(cartText), "cart shows final USD amount", "");
  log(/Final payment is charged in USD/i.test(cartText), "cart shows USD-charge note", "");
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${c.id}`); } catch {}
  try { c.cdp.ws.close(); } catch {}

  // ---------- 5b) guest -> account currency merge on sign-up ----------
  {
    const g = await openTab(`${BASE}/en/shop`);
    await evalJs(g.cdp, "(()=>{const sel=document.querySelector('.header-actions .currency-switch');if(!sel)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;s.call(sel,'COP');sel.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
    await sleep(600);
    await evalJs(g.cdp, "window.location.href='/en/signup'; true");
    await sleep(2000);
    const email = `merge-${Date.now()}@example.com`;
    await setInput(g.cdp, "#su-first", "Merge");
    await setInput(g.cdp, "#su-email", email);
    await setInput(g.cdp, "#su-password", "Merge2026!");
    await setInput(g.cdp, "#su-confirm", "Merge2026!");
    await evalJs(g.cdp, "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Sign up');b?.click();return true})()");
    await sleep(2800);
    const path = await evalJs(g.cdp, "location.pathname");
    const selectCur = await evalJs(g.cdp, "document.querySelector('.header-actions .currency-switch')?.value ?? 'NONE'");
    log(path === "/en/account" && selectCur === "COP", "guest currency merged into account on sign-up", `path=${path} cur=${selectCur}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${g.id}`); } catch {}
    try { g.cdp.ws.close(); } catch {}
  }

  // ---------- 6) admin product form USD-only label ----------
  const ad = await openTab(`${BASE}/login`);
  await setInput(ad.cdp, "#admin-email", process.env.ADMIN_EMAIL);
  await setInput(ad.cdp, "#admin-password", process.env.ADMIN_PASSWORD);
  await evalJs(ad.cdp, "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Entrar');b?.click();return true})()");
  await sleep(2200);
  const adPath = await evalJs(ad.cdp, "location.pathname");
  log(adPath === "/admin", "admin login -> /admin", `path=${adPath}`);
  const pf = await openTab(`${BASE}/admin/products/new`);
  await sleep(1600);
  const hasUsd = await evalJs(pf.cdp, "document.body.textContent.includes('Price (USD)')");
  log(hasUsd, "admin product form label is Price (USD)", "");
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${pf.id}`); } catch {}
  try { pf.cdp.ws.close(); } catch {}
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${ad.id}`); } catch {}
  try { ad.cdp.ws.close(); } catch {}
} catch (e) {
  failures++; console.log("ERROR:", e.message);
} finally {
  await killChromeTree({ port: PORT, profile });
}
console.log(failures === 0 ? "\nphase8: ALL OK" : `\nphase8: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
