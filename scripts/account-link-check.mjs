// Account icon routing check: desktop header + mobile menu, EN/ES, signed-out
// redirect to sign-in and signed-in dashboard.
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
  await sleep(1200); return { cdp, id: target.id, errors };
}
const evalJs = async (cdp, expr) => { const r = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result?.value; };
const setInput = (cdp, sel, v) => evalJs(cdp, `(()=>{const el=document.querySelector(${JSON.stringify(sel)});if(!el)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
const click = (cdp, t) => evalJs(cdp, `(()=>{const el=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(t)});if(!el)return false;el.click();return true})()`);

const ACCOUNT_LABEL = { en: "My account", es: "Mi cuenta" };

try {
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}; await sleep(300); }

  // ---------- desktop + mobile href per locale (and Contact untouched) ----------
  for (const loc of ["en", "es"]) {
    const t = await openTab(`${BASE}/${loc}/`);
    await cdpDesk(t.cdp, 1280, 900);
    const desktopHref = await evalJs(t.cdp, "document.querySelector('.header-actions a[href*=\"/account\"]')?.getAttribute('href') ?? 'NO'");
    log(desktopHref === `/${loc}/account`, `desktop account icon -> /${loc}/account`, desktopHref);
    const contactHref = await evalJs(t.cdp, "document.querySelector('.nav a[href*=\"/contact\"]')?.getAttribute('href') ?? 'NO'");
    log(contactHref === `/${loc}/contact`, `nav Contact unchanged -> /${loc}/contact`, contactHref);

    // mobile menu
    await cdpDesk(t.cdp, 390, 844);
    await evalJs(t.cdp, "document.querySelector('.menu-btn')?.click(); true");
    await sleep(500);
    const mobileHref = await evalJs(t.cdp, "document.querySelector('.mobile-menu__row-link[href*=\"/account\"]')?.getAttribute('href') ?? 'NO'");
    log(mobileHref === `/${loc}/account`, `mobile account link -> /${loc}/account`, mobileHref);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // ---------- signed-out: click account icon -> sign-in screen ----------
  {
    const t = await openTab(`${BASE}/en/`);
    await cdpDesk(t.cdp, 1280, 900);
    await evalJs(t.cdp, "document.querySelector('.header-actions a[href*=\"/account\"]')?.click(); true");
    await sleep(2200);
    const path = await evalJs(t.cdp, "location.pathname");
    const hasLogin = await evalJs(t.cdp, "document.querySelector('#si-email') !== null");
    log(path === "/en/signin" && hasLogin, "signed-out account icon -> /en/signin", `path=${path}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // ---------- signed-in: sign up -> account dashboard ----------
  {
    const email = `acct-${Date.now()}@example.com`;
    const t = await openTab(`${BASE}/en/signup`);
    await setInput(t.cdp, "#su-first", "Link");
    await setInput(t.cdp, "#su-last", "Tester");
    await setInput(t.cdp, "#su-email", email);
    await setInput(t.cdp, "#su-password", "LinkPass2026!");
    await setInput(t.cdp, "#su-confirm", "LinkPass2026!");
    await click(t.cdp, "Sign up");
    await sleep(2500);
    const path = await evalJs(t.cdp, "location.pathname");
    const hasNav = await evalJs(t.cdp, "document.querySelector('.account__nav') !== null");
    log(path === "/en/account" && hasNav, "signed-in account icon -> /en/account dashboard", `path=${path}`);
    log(t.errors.length === 0, "signed-in account no console errors", t.errors.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++; console.log("ERROR:", e.message);
} finally {
  await killChromeTree({ port: PORT, profile });
}
console.log(failures === 0 ? "\naccount-link: ALL OK" : `\naccount-link: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);

async function cdpDesk(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
}
