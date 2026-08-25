// Social visibility: homepage Instagram section uses configured URL/handle,
// footer shows active socials, admin changes apply after refresh, disabled
// Instagram -> graceful empty state.
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
const IG_URL = "https://instagram.com/arem.world";
const IG_LABEL = "@arem.world";

function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const listeners = [];
    ws.onopen = () => res({ ws, send(method, params = {}) { return new Promise((r, j) => { const m = ++id; pending.set(m, { r, j }); ws.send(JSON.stringify({ id: m, method, params })); }); }, on(e, f) { listeners.push([e, f]); } });
    ws.onerror = (e) => rej(new Error("ws err"));
    ws.onmessage = (ev) => { const msg = JSON.parse(ev.data); if (msg.id && pending.has(msg.id)) { const { r, j } = pending.get(msg.id); pending.delete(msg.id); if (msg.error) j(new Error(msg.error.message)); else r(msg.result); } else if (msg.method) { for (const [e, f] of listeners) if (e === msg.method) f(msg.params); } };
  });
}
async function openTab(url, mobile = false) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await res.json(); const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable"); await cdp.send("Log.enable"); await cdp.send("Page.enable");
  if (mobile) await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const errors = [];
  cdp.on("Runtime.exceptionThrown", (p) => errors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text));
  cdp.on("Log.entryAdded", (p) => { if (p.entry?.level === "error") errors.push(p.entry.text); });
  for (let i = 0; i < 60; i++) { const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (result.value === "complete") break; await sleep(200); }
  await sleep(1600); return { cdp, id: target.id, errors };
}
const evalJs = async (cdp, exp) => { const r = await cdp.send("Runtime.evaluate", { expression: exp, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result?.value; };

// ---- admin helpers (login + update instagram) ----
async function adminCookie() {
  const lr = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) });
  return lr.headers.get("set-cookie")?.split(";")[0] ?? "";
}
async function setInstagram(cookie, { value, label, active }) {
  const row = await (await fetch(`${BASE}/api/admin/social-links`, { headers: { cookie } })).json();
  const ig = row.find((s) => s.network === "instagram");
  const res = await fetch(`${BASE}/api/admin/social-links`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ id: ig.id, network: "instagram", label, value, active, displayOrder: ig.display_order }) });
  return res.status;
}
async function homeInsta(t) {
  return evalJs(t.cdp, `(()=>{
    const head=document.querySelector('.insta-head__link');
    const handle=document.querySelector('.insta-handle');
    const follow=document.querySelector('.insta-follow');
    const tile=document.querySelector('.insta-tile');
    return JSON.stringify({
      heading: head?.getAttribute('href') ?? null,
      handle: handle?.getAttribute('href') ?? null,
      handleText: handle?.textContent.trim() ?? null,
      follow: follow?.getAttribute('href') ?? null,
      tile: tile?.getAttribute('href') ?? null,
      tileCount: document.querySelectorAll('.insta-tile').length,
      followText: follow?.textContent.trim() ?? null,
      emptyNote: document.querySelector('.insta-empty-note')?.textContent.trim() ?? null,
    });
  })()`);
}

try {
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}; await sleep(300); }

  // ---------- baseline: configured instagram flows everywhere ----------
  {
    const t = await openTab(`${BASE}/en/`);
    const s = JSON.parse(await homeInsta(t));
    const same = s.heading === IG_URL && s.handle === IG_URL && s.follow === IG_URL && s.tile === IG_URL;
    log(same, "homepage insta heading/handle/follow/tile -> configured URL", `h=${s.heading}`);
    log(s.handleText === IG_LABEL, "homepage shows configured handle", s.handleText);
    log(s.tileCount >= 6, "instagram tiles render", `n=${s.tileCount}`);
    const footerLinks = await evalJs(t.cdp, "[...document.querySelectorAll('.footer__socials a')].map(a=>a.getAttribute('href'))");
    log(footerLinks.some((h) => h === IG_URL), "footer contains active instagram link", "");
    log(t.errors.length === 0, "homepage no console errors", t.errors.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // ---------- change instagram URL in admin -> applies on refresh ----------
  const cookie = await adminCookie();
  await setInstagram(cookie, { value: "https://instagram.com/arem.test", label: "@arem.test", active: true });
  {
    const t = await openTab(`${BASE}/en/`);
    const s = JSON.parse(await homeInsta(t));
    const newUrl = "https://instagram.com/arem.test";
    log(s.heading === newUrl && s.handle === newUrl && s.follow === newUrl && s.tile === newUrl, "after admin URL change, all insta links update on refresh", `tile=${s.tile}`);
    log(s.handleText === "@arem.test", "handle updates", s.handleText);
    const footerLinks = await evalJs(t.cdp, "[...document.querySelectorAll('.footer__socials a')].map(a=>a.getAttribute('href'))");
    log(footerLinks.includes(newUrl), "footer social link uses updated instagram URL", "");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // ---------- disable instagram -> graceful empty state ----------
  await setInstagram(cookie, { value: "https://instagram.com/arem.world", label: "@arem.world", active: false });
  {
    const t = await openTab(`${BASE}/en/`);
    const s = JSON.parse(await homeInsta(t));
    log(s.heading === null && s.follow === null && s.tile === null, "disabled instagram -> no link/tile clickable", `empty=${s.emptyNote}`);
    log(!!s.emptyNote, "empty-state note shown", s.emptyNote);
    const footerLinks = await evalJs(t.cdp, "[...document.querySelectorAll('.footer__socials a')].map(a=>a.getAttribute('href'))");
    log(!footerLinks.some((h) => h && h.includes("instagram")), "footer hides disabled instagram", "");
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // ---------- restore + mobile ----------
  await setInstagram(cookie, { value: IG_URL, label: IG_LABEL, active: true });
  {
    const t = await openTab(`${BASE}/en/`, true);
    const s = JSON.parse(await homeInsta(t));
    log(s.follow === IG_URL && s.tileCount >= 6, "mobile insta follow + tiles present", `follow=${!!s.follow}`);
    log(s.heading === IG_URL, "mobile heading links to instagram", s.heading);
    log(t.errors.length === 0, "mobile no console errors", t.errors.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++; console.log("ERROR:", e.message);
} finally {
  await killChromeTree({ port: PORT, profile });
}
console.log(failures === 0 ? "\nsocial-visibility: ALL OK" : `\nsocial-visibility: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
