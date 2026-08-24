// AREM WORLD — capture bilingual screenshots for visual review.
// Usage: node scripts/shots.mjs [baseUrl] [outDir]

import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "shots";
const { chrome, profile, port: PORT } = await launchChrome();

const shots = [
  { name: "home-en-desktop", route: "/en/", width: 1440, height: 1000, mobile: false },
  { name: "home-es-desktop", route: "/es/", width: 1440, height: 1000, mobile: false },
  { name: "home-en-mobile", route: "/en/", width: 390, height: 844, mobile: true },
  { name: "shop-en-desktop", route: "/en/shop", width: 1440, height: 1000, mobile: false },
  { name: "pdp-es-desktop", route: "/es/products/wayuu-mochila-katsu", width: 1440, height: 1000, mobile: false },
  { name: "footer-en-desktop", route: "/en/", width: 1440, height: 2600, mobile: false },
];

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

async function waitForLoad(cdp) {
  for (let i = 0; i < 100; i++) {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (result.value === "complete") {
      await sleep(1200);
      return;
    }
    await sleep(200);
  }
}

try {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      /* retry */
    }
    await sleep(300);
  }

  for (const shot of shots) {
    try {
      const newRes = await fetch(
        `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + shot.route)}`,
        { method: "PUT" },
      );
      const target = await newRes.json();
      const cdp = await connect(target.webSocketDebuggerUrl);
      await cdp.send("Page.enable");
      await cdp.send("Runtime.enable");
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: shot.width,
        height: shot.height,
        deviceScaleFactor: 1,
        mobile: shot.mobile,
      });
      await waitForLoad(cdp);
      const shotRes = await cdp.send("Page.captureScreenshot", { format: "png" });
      if (!shotRes || !shotRes.data) {
        throw new Error(`screenshot returned no data: ${JSON.stringify(shotRes).slice(0, 200)}`);
      }
      writeFileSync(join(OUT, `${shot.name}.png`), Buffer.from(shotRes.data, "base64"));
      console.log(`[ok] ${shot.name}.png (${shot.route})`);
      try {
        await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
      } catch {}
      try {
        cdp.ws.close();
      } catch {}
    } catch (e) {
      console.log(`[fail] ${shot.name}: ${e.message}`);
    }
  }
} finally {
  killChromeTree({ port: PORT, profile });
}
console.log(`screenshots → ${OUT}/`);
process.exit(0);
