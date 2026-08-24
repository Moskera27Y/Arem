// AREM WORLD — headless browser smoke test (bilingual).
// Renders every route in both locales over CDP, captures console errors /
// uncaught exceptions, checks language-specific content, verifies the
// language switcher interaction, and checks responsive behavior at mobile
// width. Usage: node scripts/smoke.mjs [baseUrl]

import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();

const routes = [
  "/en/",
  "/es/",
  "/en/shop",
  "/es/shop",
  "/es/shop?category=textiles",
  "/en/collections",
  "/es/collections",
  "/en/collections/raiz",
  "/es/collections/raiz",
  "/en/about",
  "/es/about",
  "/en/stories",
  "/es/stories",
  "/en/stories/tejer-el-desierto",
  "/es/stories/tejer-el-desierto",
  "/en/regions",
  "/es/regions",
  "/en/regions/la-guajira",
  "/es/regions/la-guajira",
  "/en/contact",
  "/es/contact",
  "/en/cart",
  "/es/cart",
  "/en/wishlist",
  "/es/wishlist",
  "/en/products/wayuu-mochila-katsu",
  "/es/products/wayuu-mochila-katsu",
];

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

async function waitForLoad(cdp, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (result.value === "complete") {
      await sleep(800);
      return;
    }
    await sleep(200);
  }
  throw new Error("page load timeout");
}

const results = [];
let failures = 0;

try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      /* retry */
    }
    await sleep(300);
  }
  if (!ready) throw new Error("chrome CDP endpoint not ready");

  for (const route of routes) {
    const errors = [];
    try {
      const newRes = await fetch(
        `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + route)}`,
        { method: "PUT" },
      );
      const target = await newRes.json();
      const cdp = await connect(target.webSocketDebuggerUrl);
      await cdp.send("Runtime.enable");
      await cdp.send("Log.enable");
      await cdp.send("Page.enable");
      cdp.on("Runtime.exceptionThrown", (p) =>
        errors.push(`exception: ${p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text}`),
      );
      cdp.on("Log.entryAdded", (p) => {
        if (p.entry?.level === "error") errors.push(`console.error: ${p.entry.text}`);
      });
      await waitForLoad(cdp);

      const evalJs = async (expression) => {
        const { result } = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
        return result.value;
      };

      // Scroll to trigger lazy loads, then count genuinely broken images.
      await evalJs("window.scrollTo(0, document.body.scrollHeight)");
      await sleep(1200);
      await evalJs("window.scrollTo(0, 0)");
      await sleep(400);

      const title = (await evalJs("document.title")) ?? "";
      const htmlLang = (await evalJs("document.documentElement.lang")) ?? "";
      const bodyText = (await evalJs("document.body.innerText")) ?? "";
      const hasSwitcher = (await evalJs("document.querySelectorAll('.lang-switch__btn').length > 0")) === true;
      const brokenImages =
        (await evalJs(
          "[...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length",
        )) ?? 0;

      const locale = route.startsWith("/es") ? "es" : "en";
      const langOk = htmlLang === locale || htmlLang === "";
      const ok = title.length > 0 && bodyText.length > 100 && brokenImages === 0 && hasSwitcher && langOk;
      results.push({ route, ok, title: title.slice(0, 60), htmlLang, brokenImages, hasSwitcher, errors });
      if (!ok) failures++;
    } catch (e) {
      failures++;
      results.push({ route, ok: false, title: "", htmlLang: "", brokenImages: 0, hasSwitcher: false, errors: [e.message] });
    }
  }

  // Language switcher interaction: on /en, click ES -> should navigate to /es
  try {
    const newRes = await fetch(
      `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + "/en/shop?category=textiles")}`,
      { method: "PUT" },
    );
    const target = await newRes.json();
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await waitForLoad(cdp);
    const evalJs = async (expression) => {
      const { result } = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
      return result.value;
    };
    const before = await evalJs("location.pathname + location.search");
    await evalJs(
      "[...document.querySelectorAll('.lang-switch__btn')].find(b => b.textContent.trim() === 'ES').click()",
    );
    await sleep(1500);
    const after = await evalJs("location.pathname + location.search");
    const afterLang = await evalJs("document.documentElement.lang");
    const esActive = (await evalJs(
      "[...document.querySelectorAll('.lang-switch__btn')].find(b => b.textContent.trim() === 'ES').classList.contains('is-active')",
    )) === true;
    console.log(`[switcher] ${before} -> ${after} (lang=${afterLang}, esActive=${esActive})`);
    const switcherOk = after.startsWith("/es/") && afterLang === "es" && esActive;
    if (switcherOk) console.log("[switcher] OK — language switch navigates and persists");
    else {
      failures++;
      console.log("[switcher] FAIL");
    }
  } catch (e) {
    failures++;
    console.log("[switcher] ERROR:", e.message);
  }

  // Responsive check at mobile width (es home)
  try {
    const newRes = await fetch(
      `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + "/es/")}`,
      { method: "PUT" },
    );
    const target = await newRes.json();
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send("Runtime.enable");
    await waitForLoad(cdp);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(700);
    const evalJs = async (expression) => {
      const { result } = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
      return result.value;
    };
    const navDisplay = await evalJs("getComputedStyle(document.querySelector('.nav')).display");
    const menuDisplay = await evalJs("getComputedStyle(document.querySelector('.menu-btn')).display");
    const switcherVisible = await evalJs("getComputedStyle(document.querySelector('.lang-switch')).display !== 'none'");
    const heroVisible = (await evalJs("document.querySelector('.hero') !== null")) === true;
    console.log(`[responsive] nav@390px=${navDisplay} menuBtn@390px=${menuDisplay} switcher=${switcherVisible} hero=${heroVisible}`);
    if (navDisplay === "none" && menuDisplay !== "none" && heroVisible) console.log("[responsive] OK");
    else {
      failures++;
      console.log("[responsive] FAIL");
    }
  } catch (e) {
    failures++;
    console.log("[responsive] ERROR:", e.message);
  }
} finally {
  killChromeTree(chrome);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* ignore */
  }
}

let consoleErrors = 0;
for (const r of results) {
  const status = r.ok ? "OK " : "FAIL";
  console.log(
    `[${status}] ${r.route} :: ${r.title || "(no title)"} :: lang=${r.htmlLang} broken=${r.brokenImages} switcher=${r.hasSwitcher}`,
  );
  for (const e of r.errors) {
    console.log(`        └─ ${e}`);
    consoleErrors++;
  }
}
console.log(`\n${results.length} routes tested, ${results.filter((r) => r.ok).length} OK, ${failures} failed, ${consoleErrors} console errors.`);
process.exit(failures > 0 ? 1 : 0);
