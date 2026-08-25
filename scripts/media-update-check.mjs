// Verify that replacing a Region media asset updates listing + detail on
// refresh (without redeploy), then restore the original value.
import pg from "pg";
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const KEY = "/images/r-andes.svg";
const res = await pool.query("select url from media where key = $1", [KEY]);
const originalUrl = res.rows[0]?.url;
const swapped = "https://ahjgv17qhwnkoe38.public.blob.vercel-storage.com/arem-media/1787622539902-imagen_2026-08-24_204856746.png"; // la-guajira blob
await pool.query("update media set url = $1 where key = $2", [swapped, KEY]);
console.log("swapped r-andes ->", swapped.slice(-30));

const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
const isBlob = (s) => typeof s === "string" && s.startsWith("https://") && s.includes("blob.vercel-storage.com");
function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const listeners = [];
    ws.onopen = () => res({ ws, send(method, params = {}) { return new Promise((r, j) => { const m = ++id; pending.set(m, { r, j }); ws.send(JSON.stringify({ id: m, method, params })); }); }, on(e, f) { listeners.push([e, f]); } });
    ws.onerror = (e) => rej(new Error("ws err"));
    ws.onmessage = (ev) => { const msg = JSON.parse(ev.data); if (msg.id && pending.has(msg.id)) { const { r, j } = pending.get(msg.id); pending.delete(msg.id); if (msg.error) j(new Error(msg.error.message)); else r(msg.result); } else if (msg.method) { for (const [e, f] of listeners) if (e === msg.method) f(msg.params); } };
  });
}
async function openTab(url) {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await r.json(); const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable"); await cdp.send("Page.enable");
  for (let i = 0; i < 60; i++) { const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (result.value === "complete") break; await sleep(200); }
  await sleep(1600); return { cdp, id: target.id };
}
const evalJs = async (cdp, exp) => (await cdp.send("Runtime.evaluate", { expression: exp, returnByValue: true })).result?.value;

try {
  // detail page fresh tab sees the swapped image
  const d = await openTab(`${BASE}/es/regions/eje-cafetero`);
  const src = await evalJs(d.cdp, "document.querySelector('.split__media img')?.getAttribute('src') ?? 'NONE'");
  log(src === swapped, "region detail reflects replaced image on refresh", src.slice(-30));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${d.id}`); } catch {}
  try { d.cdp.ws.close(); } catch {}

  const rl = await openTab(`${BASE}/es/regions`);
  const card = await evalJs(rl.cdp, "[...document.querySelectorAll('img')].map(i=>i.getAttribute('src')).find(s=>s && s.includes('blob.vercel-storage.com')) ?? 'NONE'");
  log(isBlob(card), "region listing card reflects changed media", card.slice(-30));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${rl.id}`); } catch {}
  try { rl.cdp.ws.close(); } catch {}
} catch (e) {
  failures++; console.log("ERROR:", e.message);
} finally {
  await pool.query("update media set url = $1 where key = $2", [originalUrl, KEY]);
  console.log("restored r-andes ->", originalUrl.slice(-30));
  await killChromeTree({ port: PORT, profile });
  await pool.end();
}
console.log(failures === 0 ? "\nmedia-update: ALL OK" : `\nmedia-update: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
