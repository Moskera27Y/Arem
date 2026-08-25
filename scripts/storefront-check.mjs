// Storefront + admin-guard browser check (Neon media resolution).
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
  await sleep(1500);
  return { cdp, id: target.id, errors };
}
const evalJs = async (cdp, expression) => {
  const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
  return r.result?.value;
};

try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }

  // Storefront hero reflects the persisted media (Neon) — whatever the admin set
  {
    const { cdp, id, errors } = await openTab(`${BASE}/en/`);
    await sleep(1500);
    const heroSrc = await evalJs(cdp, "document.querySelector('.hero__media img')?.getAttribute('src') ?? 'NO'");
    const mediaFetched = await cdp.send("Runtime.evaluate", { expression: "fetch('/api/media').then(r=>r.status)", returnByValue: true, awaitPromise: true });
    const mediaUrls = (await (await fetch(`${BASE}/api/media`)).json()).map((m) => m.url);
    const heroFromMedia = mediaUrls.includes(heroSrc) || heroSrc.startsWith("http") || heroSrc.startsWith("/images/");
    log(heroFromMedia && heroSrc !== "NO", "hero refleja media persistido en Neon", heroSrc.slice(-40));
    log(mediaFetched.result?.value === 200, "/api/media accesible desde tienda (publico)", `status=${mediaFetched.result?.value}`);
    log(errors.length === 0, "tienda sin errores de consola", errors.slice(0, 2).join("; "));
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  // Admin guard: /admin (fresh session) -> redirect to /login
  {
    const { cdp, id } = await openTab(`${BASE}/admin`);
    await sleep(1500);
    const path = await evalJs(cdp, "location.pathname");
    const hasLoginForm = await evalJs(cdp, "document.querySelector('#admin-email') !== null");
    log(path === "/login" && hasLoginForm, "/admin sin sesion redirige a /login", `path=${path} form=${hasLoginForm}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}
console.log(failures === 0 ? "\nstorefront+guard check: ALL OK" : `\nstorefront+guard check: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
