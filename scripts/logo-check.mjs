// Verificación del nuevo logo AREM WORLD (cabecera + pie, escritorio/móvil, EN/ES).
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

try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }

  for (const [locale, homePath] of [["en", "/en/"], ["es", "/es/"]]) {
    const { cdp, id, errors } = await openTab(`${BASE}${homePath}`);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(400);

    const headerSrc = await evalJs(cdp, "document.querySelector('.site-header .logo__img')?.getAttribute('src') ?? 'NO'");
    const headerAlt = await evalJs(cdp, "document.querySelector('.site-header .logo__img')?.getAttribute('alt') ?? 'NO'");
    const headerHref = await evalJs(cdp, "document.querySelector('.site-header .logo')?.getAttribute('href') ?? 'NO'");
    const headerLoaded = await evalJs(cdp, "document.querySelector('.site-header .logo__img')?.complete ?? false");
    const headerRect = await evalJs(cdp, "(() => { const i = document.querySelector('.site-header .logo__img'); if (!i) return null; const r = i.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })()");
    const aspect = await evalJs(cdp, "getComputedStyle(document.querySelector('.site-header .logo__img')).aspectRatio");

    log(headerSrc.endsWith("/brand/arem-world-logo.svg"), `${locale} header usa el SVG`, headerSrc);
    log(headerAlt === "AREM WORLD — Colombian craftsmanship", `${locale} alt correcto`, headerAlt);
    log(headerHref === `/${locale}` || headerHref === `/${locale}/`, `${locale} logo enlaza a la home localizada`, headerHref);
    log(headerLoaded === true, `${locale} logo cargado en cabecera`);
    log(headerRect && headerRect.h >= 42 && headerRect.h <= 52 && headerRect.w >= 100, `${locale} altura desktop ~42-52px + aspect`, `h=${headerRect?.h} w=${headerRect?.w}`);

    // Footer
    const footHref = await evalJs(cdp, "document.querySelector('.footer .logo')?.getAttribute('href') ?? 'NO'");
    const footFilter = await evalJs(cdp, "getComputedStyle(document.querySelector('.footer .logo__img')).filter");
    const footH = await evalJs(cdp, "(() => { const i = document.querySelector('.footer .logo__img'); return i ? Math.round(i.getBoundingClientRect().height) : 0; })()");
    log(footHref === `/${locale}` || footHref === `/${locale}/`, `${locale} pie logo enlaza a home`, footHref);
    log(footH >= 48, `${locale} footer logo mas grande`, `h=${footH}`);
    log(footFilter.includes("brightness(0)"), `${locale} footer logo adaptado a fondo oscuro (sin recolorar asset)`);

    // Móvil
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    const mH = await evalJs(cdp, "(() => { const i = document.querySelector('.site-header .logo__img'); return i ? Math.round(i.getBoundingClientRect().height) : 0; })()");
    const mHref = await evalJs(cdp, "document.querySelector('.site-header .logo')?.getAttribute('href') ?? 'NO'");
    log(mH >= 32 && mH <= 40, `${locale} altura mobile ~32-40px`, `h=${mH}`);
    log(mHref === `/${locale}` || mHref === `/${locale}/`, `${locale} mobile logo enlaza a home`, mHref);

    const overflowX = await evalJs(cdp, "document.documentElement.scrollWidth > window.innerWidth");
    log(!overflowX, `${locale} sin overflow horizontal en movil`);

    log(errors.length === 0, `${locale} sin errores de consola`, errors.slice(0, 2).join("; "));

    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}

console.log(failures === 0 ? "\nverificacion logo: ALL OK" : `\nverificacion logo: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
