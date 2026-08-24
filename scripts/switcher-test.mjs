// AREM WORLD — language selector routing test.
// Covers the critical fix (EN<->ES from bare /en and /es), subpath switches,
// query preservation, cookie persistence across refresh and navigation,
// first-visit English default, and the mobile-menu selector.
// Usage: node scripts/switcher-test.mjs [baseUrl]

import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
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
      });
    ws.onerror = (e) => reject(new Error(`WS error: ${e.message ?? "connect failed"}`));
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
      }
    };
  });
}

async function openTab(url) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await res.json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  for (let i = 0; i < 50; i++) {
    const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    if (result.value === "complete") break;
    await sleep(200);
  }
  await sleep(800);
  return { cdp, id: target.id };
}

let failures = 0;
const log = (ok, label, extra = "") => {
  if (!ok) failures++;
  console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? ` :: ${extra}` : ""}`);
};

try {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    await sleep(300);
  }

  const clickAndWait = async (cdp, selector, text) => {
    const clicked = await cdp.send("Runtime.evaluate", {
      expression: `(() => { const b = [...document.querySelectorAll(${JSON.stringify(selector)})].find(x => x.textContent.trim() === ${JSON.stringify(text)}); if (!b) return false; b.click(); return true; })()`,
      returnByValue: true,
    });
    await sleep(1200);
    return clicked.result?.value ?? false;
  };
  const evalJs = async (cdp, expression) => {
    const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
    return r.result?.value;
  };

  // --- 1. Critical bug: bare /es -> EN, bare /en -> ES
  {
    const { cdp, id } = await openTab(`${BASE}/es`);
    const clicked = await clickAndWait(cdp, ".lang-switch__btn", "EN");
    const url = await evalJs(cdp, "location.pathname");
    const status = await fetch(`${BASE}${url}`).then((r) => r.status).catch(() => 0);
    log(clicked && url === "/en" && status === 200, "/es -> EN", `path=${url} status=${status}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
  {
    const { cdp, id } = await openTab(`${BASE}/en`);
    const clicked = await clickAndWait(cdp, ".lang-switch__btn", "ES");
    const url = await evalJs(cdp, "location.pathname");
    const status = await fetch(`${BASE}${url}`).then((r) => r.status).catch(() => 0);
    log(clicked && url === "/es" && status === 200, "/en -> ES", `path=${url} status=${status}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  // --- 2. Subpath switches + query preservation
  {
    const { cdp, id } = await openTab(`${BASE}/en/shop`);
    const clicked = await clickAndWait(cdp, ".lang-switch__btn", "ES");
    const url = await evalJs(cdp, "location.pathname");
    log(clicked && url === "/es/shop", "/en/shop -> ES", `path=${url}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
  {
    const { cdp, id } = await openTab(`${BASE}/es/shop?category=textiles`);
    const clicked = await clickAndWait(cdp, ".lang-switch__btn", "EN");
    const path = await evalJs(cdp, "location.pathname");
    const search = await evalJs(cdp, "location.search");
    const status = await fetch(`${BASE}${path}${search}`).then((r) => r.status).catch(() => 0);
    log(
      clicked && path === "/en/shop" && search === "?category=textiles" && status === 200,
      "/es/shop?category=textiles -> EN (query preserved)",
      `path=${path}${search} status=${status}`,
    );
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
  {
    const { cdp, id } = await openTab(`${BASE}/en/collections`);
    const clicked = await clickAndWait(cdp, ".lang-switch__btn", "ES");
    const url = await evalJs(cdp, "location.pathname");
    log(clicked && url === "/es/collections", "/en/collections -> ES", `path=${url}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  // --- 3. Cookie persistence: switch to /es, reload, navigate to bare /
  {
    const { cdp, id } = await openTab(`${BASE}/en/about`);
    await clickAndWait(cdp, ".lang-switch__btn", "ES");
    const cookieAfterSwitch = await evalJs(cdp, "document.cookie");
    const hasEsCookie = cookieAfterSwitch.includes("AREM_LOCALE=es");
    // refresh: URL keeps /es
    await evalJs(cdp, "location.reload()");
    await sleep(1500);
    const pathAfterRefresh = await evalJs(cdp, "location.pathname");
    // navigate to bare / : middleware should keep es (cookie)
    await evalJs(cdp, "window.location.href = '/'");
    await sleep(1500);
    const pathAfterRoot = await evalJs(cdp, "location.pathname");
    const refreshOk = pathAfterRefresh === "/es/about" || pathAfterRefresh === "/es/about/";
    const rootOk = pathAfterRoot === "/es" || pathAfterRoot === "/es/";
    log(
      hasEsCookie && refreshOk && rootOk,
      "persistence (cookie, refresh, bare /)",
      `cookie=${hasEsCookie} afterRefresh=${pathAfterRefresh} afterBareRoot=${pathAfterRoot}`,
    );
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  // --- 4. First visit: start from about:blank so no navigation happens before
  // cookies are cleared; force a Spanish Accept-Language — the default must
  // still be English (requirement 5).
  {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    const target = await res.json();
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");
    await cdp.send("Network.clearBrowserCookies");
    await cdp.send("Network.setExtraHTTPHeaders", { headers: { "Accept-Language": "es-ES,es;q=0.9,en;q=0.4" } });
    await cdp.send("Page.enable");
    await sleep(500);
    await evalJs(cdp, `window.location.href = '${BASE}/'`);
    // Poll until the tab actually leaves about:blank and the redirect settles.
    let path = "";
    for (let i = 0; i < 30; i++) {
      await sleep(400);
      path = (await evalJs(cdp, "location.pathname")) ?? "";
      const href = (await evalJs(cdp, "location.href")) ?? "";
      if (href.includes("localhost") && path.length > 0 && path !== "blank") break;
    }
    await sleep(600);
    path = (await evalJs(cdp, "location.pathname")) ?? "";
    const cookie = (await evalJs(cdp, "document.cookie")) ?? "";
    log(path === "/en" || path === "/en/", "first visit default EN (even with Spanish browser)", `path=${path} cookie=${cookie}`);
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }

  // --- 5. Mobile menu selector at 390px
  {
    const { cdp, id } = await openTab(`${BASE}/es`);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    const menuOpened = await evalJs(cdp, "(() => { const b = document.querySelector('.menu-btn'); if (!b) return false; b.click(); return true; })()");
    await sleep(600);
    const switchers = await evalJs(cdp, "document.querySelectorAll('.mobile-menu .lang-switch__btn').length");
    const clicked = await clickAndWait(cdp, ".mobile-menu .lang-switch__btn", "EN");
    const path = await evalJs(cdp, "location.pathname");
    log(
      menuOpened && switchers > 0 && clicked && (path === "/en" || path === "/en/"),
      "mobile menu selector /es -> EN",
      `menu=${menuOpened} btns=${switchers} clicked=${clicked} path=${path}`,
    );
    try { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); } catch {}
    try { cdp.ws.close(); } catch {}
  }
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}

console.log(failures === 0 ? "\nswitcher routing: ALL OK" : `\nswitcher routing: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
