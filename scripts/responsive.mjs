// Responsive verification across five viewport widths.
// Usage: node scripts/responsive.mjs [baseUrl]

import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();

let ws;
try {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) break;
    } catch {}
    await sleep(300);
  }
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + "/")}`, { method: "PUT" });
  const t = await res.json();
  ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evalJs = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    return r.result?.result?.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  for (let i = 0; i < 50; i++) {
    const v = await evalJs("document.readyState");
    if (v === "complete") break;
    await sleep(200);
  }
  await sleep(800);

  let failed = 0;
  for (const width of [360, 768, 900, 1024, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(400);
    const nav = await evalJs("getComputedStyle(document.querySelector('.nav')).display");
    const menu = await evalJs("getComputedStyle(document.querySelector('.menu-btn')).display");
    const cols = await evalJs("getComputedStyle(document.querySelector('.grid--4')).gridTemplateColumns");
    const heroH = await evalJs("document.querySelector('.hero').getBoundingClientRect().height");
    const overflowX = await evalJs("document.documentElement.scrollWidth > window.innerWidth");
    const expectNavHidden = width <= 900;
    const navOk = expectNavHidden ? nav === "none" : nav !== "none";
    const menuOk = expectNavHidden ? menu !== "none" : true;
    const status = navOk && menuOk && !overflowX ? "OK " : "FAIL";
    if (!(navOk && menuOk && !overflowX)) failed++;
    console.log(
      `[${status}] width=${width} nav=${nav} menuBtn=${menu} grid4=${cols} heroH=${Math.round(heroH)}px overflowX=${overflowX}`,
    );
  }
  console.log(failed === 0 ? "responsive: ALL OK" : `responsive: ${failed} FAILURES`);
  process.exitCode = failed === 0 ? 0 : 1;
} finally {
  try {
    ws?.close();
  } catch {}
  killChromeTree(chrome);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {}
}
