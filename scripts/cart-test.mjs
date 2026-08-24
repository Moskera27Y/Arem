// AREM WORLD — cart interaction test in both locales.
// Opens a product page, selects an option, adds to cart, verifies the drawer
// shows the localized product/variant, then checks the cart page.

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

try {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    await sleep(300);
  }

  for (const [locale, productName, optionValue] of [
    ["en", "Wayuu Mochila", "Arena"],
    ["es", "Mochila Wayuu", "Arena"],
  ]) {
    const { cdp, id } = await openTab(`${BASE}/${locale}/products/wayuu-mochila-katsu`);
    const evalJs = async (expression) => {
      const { result } = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
      return result.value;
    };

    // Select the second option (Arena — in stock), then add to cart.
    const optionBtns = await evalJs("document.querySelectorAll('.option-btn').length");
    const clicked = await evalJs(
      "(() => { const b = document.querySelectorAll('.option-btn')[1]; if (!b) return false; b.click(); return true; })()",
    );
    await sleep(400);
    const disabledBefore = await evalJs(
      "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Agregar') || x.textContent.includes('Add to cart')); return b ? b.disabled : null; })()",
    );
    const addClicked = await evalJs(
      "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Agregar') || x.textContent.includes('Add to cart')); if (!b) return false; b.click(); return true; })()",
    );
    await sleep(800);
    const drawerOpen = (await evalJs("document.querySelector('.drawer').dataset.open")) === "true";
    const drawerText = (await evalJs("document.querySelector('.drawer').innerText")) ?? "";
    const nameOk = drawerText.includes(productName);
    const variantOk = drawerText.includes(optionValue);
    const ok = optionBtns === 3 && clicked && disabledBefore === false && addClicked && drawerOpen && nameOk && variantOk;
    if (!ok) failures++;
    console.log(
      `[${ok ? "OK " : "FAIL"}] ${locale} add-to-cart :: options=${optionBtns} disabled=${disabledBefore} drawerOpen=${drawerOpen} name=${nameOk} variant(${optionValue})=${variantOk}`,
    );
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`);
    } catch {}
    try {
      cdp.ws.close();
    } catch {}
  }

  // Cart page shows persisted line (localStorage survives in the same tab only;
  // verify the drawer state instead: reopen the EN PDP, add, open /cart).
  const { cdp, id } = await openTab(`${BASE}/en/products/wayuu-mochila-katsu`);
  const evalJs = async (expression) => {
    const { result } = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
    return result.value;
  };
  await evalJs("(() => { const b = document.querySelectorAll('.option-btn')[0]; b?.click(); return true; })()");
  await sleep(300);
  await evalJs("(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Add to cart')); b?.click(); return true; })()");
  await sleep(600);
  await evalJs("window.location.href = '/en/cart'");
  await sleep(1200);
  const cartText = (await evalJs("document.body.innerText")) ?? "";
  const cartHasLine = cartText.includes("Wayuu Mochila");
  const cartHasTotal = cartText.includes("Total") || cartText.includes("Subtotal");
  console.log(`[${cartHasLine && cartHasTotal ? "OK " : "FAIL"}] cart page shows persisted line (line=${cartHasLine}, summary=${cartHasTotal})`);
  if (!(cartHasLine && cartHasTotal)) failures++;
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  killChromeTree({ port: PORT, profile });
}

console.log(failures === 0 ? "\ncart interaction: ALL OK" : `\ncart interaction: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
