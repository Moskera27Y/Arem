// Region + Story detail pages use the same Neon-backed media as the cards.
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
const blobUri = (s) => typeof s === "string" && s.startsWith("https://") && s.includes("blob.vercel-storage.com");

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
  for (let i = 0; i < 60; i++) { const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (result.value === "complete") break; await sleep(200); }
  await sleep(1600); return { cdp, id: target.id };
}
const evalJs = async (cdp, exp) => { const r = await cdp.send("Runtime.evaluate", { expression: exp, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result?.value; };

try {
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}; await sleep(300); }

  const cases = [
    { url: `/en/regions/eje-cafetero`, sel: ".split__media img", label: "EN region Eje Cafetero detail" },
    { url: `/es/regions/eje-cafetero`, sel: ".split__media img", label: "ES region Eje Cafetero detail" },
    { url: `/en/regions/la-guajira`, sel: ".split__media img", label: "EN region La Guajira detail" },
    { url: `/es/regions/la-guajira`, sel: ".split__media img", label: "ES region La Guajira detail" },
    { url: `/en/stories/tejer-el-desierto`, sel: ".article__media img", label: "EN story detail" },
    { url: `/es/stories/tejer-el-desierto`, sel: ".article__media img", label: "ES story detail" },
  ];
  for (const c of cases) {
    const t = await openTab(`${BASE}${c.url}`);
    const src = await evalJs(t.cdp, `document.querySelector(${JSON.stringify(c.sel)})?.getAttribute('src') ?? 'NONE'`);
    log(blobUri(src), `${c.label} uses Blob media`, src.slice(-46));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); } catch {}
    try { t.cdp.ws.close(); } catch {}
  }

  // listing card consistency: region + story cards use Blob too
  const rl = await openTab(`${BASE}/es/regions`);
  const regionCard = await evalJs(rl.cdp, "document.querySelector('.region-card img, .story-card img, .category-card img')?.getAttribute('src') ?? 'NONE'");
  log(blobUri(regionCard), "region listing card uses Blob media", regionCard.slice(-40));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${rl.id}`); } catch {}
  try { rl.cdp.ws.close(); } catch {}

  const sl = await openTab(`${BASE}/en/stories`);
  const storyCard = await evalJs(sl.cdp, "document.querySelector('.story-card img')?.getAttribute('src') ?? 'NONE'");
  log(blobUri(storyCard), "story listing card uses Blob media", storyCard.slice(-40));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${sl.id}`); } catch {}
  try { sl.cdp.ws.close(); } catch {}
} catch (e) {
  failures++; console.log("ERROR:", e.message);
} finally {
  await killChromeTree({ port: PORT, profile });
}
console.log(failures === 0 ? "\nregion-story media: ALL OK" : `\nregion-story media: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
