// Phase 7 end-to-end: customer signup, protected account routes, profile,
// addresses, guest->account wishlist merge, orders + tracking placeholders.
import pg from "pg";
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const EMAIL = `test-${Date.now()}@example.com`;
const PASSWORD = "Passw0rd2026!";
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
const cookie = (r) => r.headers.get("set-cookie")?.split(";")[0] ?? "";
const j = (r) => r.json();

// ---------- seed a sample order for the customer (direct Neon) ----------
async function seedOrder(customerId) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const orderNumber = `AREM-${Date.now().toString().slice(-6)}`;
  const o = await pool.query(
    `insert into public.orders (order_number, customer_profile_id, status, payment_status, currency, subtotal, shipping_total, tax_total, total, shipping_address)
     values ($1,$2,'processing','paid','USD',250000,0,0,250000,$3) returning id`,
    [orderNumber, customerId, JSON.stringify({ recipient_name: "Test Buyer", line1: "Calle 123", city: "Bogotá", country: "CO" })],
  );
  const orderId = o.rows[0].id;
  await pool.query(
    `insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total) values
     ($1,'wayuu-mochila-katsu','Wayuu Mochila "Katsü"',250000,1,250000)`,
    [orderId],
  );
  const s = await pool.query(
    "insert into public.shipments (order_id, status, carrier, tracking_number) values ($1,'shipped','Carrier Placeholder','TRK-123456') returning id",
    [orderId],
  );
  const shipId = s.rows[0].id;
  await pool.query(
    "insert into public.tracking_events (shipment_id, status, description) values ($1,'pending','Order received'),($1,'shipped','Package in transit')",
    [shipId],
  );
  await pool.end();
  return { orderId, orderNumber };
}

// ---------- browser helpers ----------
function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pending = new Map(); const listeners = [];
    ws.onopen = () => res({ ws, send(method, params = {}) { return new Promise((r, j) => { const m = ++id; pending.set(m, { r, j }); ws.send(JSON.stringify({ id: m, method, params })); }); }, on(e, f) { listeners.push([e, f]); } });
    ws.onerror = (e) => rej(new Error("ws err"));
    ws.onmessage = (ev) => { const msg = JSON.parse(ev.data); if (msg.id && pending.has(msg.id)) { const { r, j } = pending.get(msg.id); pending.delete(msg.id); if (msg.error) j(new Error(msg.error.message)); else r(msg.result); } else if (msg.method) { for (const [e, f] of listeners) if (e === msg.method) f(msg.params); } };
  });
}
const { chrome, profile, port: PORT } = await launchChrome();
async function openTab(url) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await res.json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable"); await cdp.send("Log.enable"); await cdp.send("Page.enable");
  const errors = [];
  cdp.on("Runtime.exceptionThrown", (p) => errors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text));
  cdp.on("Log.entryAdded", (p) => { if (p.entry?.level === "error") errors.push(p.entry.text); });
  for (let i = 0; i < 60; i++) { const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (result.value === "complete") break; await sleep(200); }
  await sleep(1200);
  return { cdp, id: target.id, errors };
}
const evalJs = async (cdp, expression) => { const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result?.value; };
const setInput = (cdp, sel, v) => evalJs(cdp, `(()=>{const el=document.querySelector(${JSON.stringify(sel)});if(!el)return false;const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);

try {
  // ---------- signup (API) ----------
  const su = await fetch(`${BASE}/api/customer/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, first_name: "Ana", last_name: "Gómez", preferred_language: "en", wishlist: ["wayuu-mochila-katsu", "cafe-organico-altura-quindio"] }),
  });
  const suBody = await j(su);
  const sessionCookie = cookie(su);
  log(su.status === 201 && suBody.ok, "signup returns 201 + cookie", `status=${su.status}`);
  const myHeaders = { cookie: sessionCookie };

  // me
  const me = await fetch(`${BASE}/api/customer/me`, { headers: myHeaders });
  const meBody = await j(me);
  log(me.status === 200 && meBody.email === EMAIL, "signin session returns profile", `email=${meBody.email}`);

  // signed-out me -> 401
  const meAnon = await fetch(`${BASE}/api/customer/me`);
  log(meAnon.status === 401, "me (signed out) 401");

  // ---------- profile update ----------
  const pf = await fetch(`${BASE}/api/customer/profile`, { method: "PUT", headers: { "Content-Type": "application/json", ...myHeaders }, body: JSON.stringify({ first_name: "Ana", last_name: "Gómez", phone: "+573001112233", preferred_language: "es" }) });
  const pfBody = await j(pf);
  log(pf.status === 200 && pfBody.phone === "+573001112233" && pfBody.preferred_language === "es", "profile update persists", `phone=${pfBody.phone} lang=${pfBody.preferred_language}`);

  // ---------- addresses ----------
  const addr = await fetch(`${BASE}/api/customer/addresses`, { method: "POST", headers: { "Content-Type": "application/json", ...myHeaders }, body: JSON.stringify({ recipient_name: "Ana Gómez", line1: "Calle 123", city: "Bogotá", country: "CO", is_default_shipping: true, is_default_billing: true }) });
  const addrBody = await j(addr);
  log(addr.status === 201 && addrBody.is_default_shipping, "address add (+default shipping)", `id=${addrBody.id}`);
  const addrList = await fetch(`${BASE}/api/customer/addresses`, { headers: myHeaders });
  const addrListBody = await j(addrList);
  log(addrListBody.length === 1 && addrListBody[0].recipient_name === "Ana Gómez", "address listed");
  const addr2 = await fetch(`${BASE}/api/customer/addresses`, { method: "POST", headers: { "Content-Type": "application/json", ...myHeaders }, body: JSON.stringify({ recipient_name: "Ana G", line1: "Av 456", city: "Medellín", country: "CO", is_default_shipping: true, is_default_billing: false }) });
  const addr2Body = await j(addr2);
  // default shipping should now point to addr2 only
  const addrList2 = await j(await fetch(`${BASE}/api/customer/addresses`, { headers: myHeaders }));
  const ships = addrList2.filter((x) => x.is_default_shipping);
  log(addr2.status === 201 && ships.length === 1 && ships[0].id === addr2Body.id, "only one default shipping enforced", `defaults=${ships.length}`);
  const delAddr = await fetch(`${BASE}/api/customer/addresses/${addrBody.id}`, { method: "DELETE", headers: myHeaders });
  log(delAddr.status === 200, "address delete ok");
  const addrList3 = await j(await fetch(`${BASE}/api/customer/addresses`, { headers: myHeaders }));
  log(addrList3.length === 1, "address deleted from list", `count=${addrList3.length}`);

  // ---------- wishlist merge (guest -> account) ----------
  const wish = await fetch(`${BASE}/api/customer/wishlist`, { headers: myHeaders });
  const wishBody = await j(wish);
  const hasFromSignup = wishBody.ids.includes("wayuu-mochila-katsu") && wishBody.ids.includes("cafe-organico-altura-quindio");
  log(hasFromSignup, "guest wishlist merged into account at signup", `ids=${wishBody.ids.length}`);
  const wAdd = await fetch(`${BASE}/api/customer/wishlist`, { method: "POST", headers: { "Content-Type": "application/json", ...myHeaders }, body: JSON.stringify({ productId: "mochila-rastro" }) });
  const wAddBody = await j(wAdd);
  log(wAddBody.ids.includes("mochila-rastro"), "wishlist add persisted", `count=${wAddBody.ids.length}`);
  const wDel = await fetch(`${BASE}/api/customer/wishlist?productId=${encodeURIComponent("mochila-rastro")}`, { method: "DELETE", headers: myHeaders });
  const wDelBody = await j(wDel);
  log(!wDelBody.ids.includes("mochila-rastro"), "wishlist remove reflected");

  // ---------- orders (seeded) ----------
  const customerId = (await j(await fetch(`${BASE}/api/customer/me`, { headers: myHeaders }))).id;
  const { orderId, orderNumber } = await seedOrder(customerId);
  const orders = await j(await fetch(`${BASE}/api/customer/orders`, { headers: myHeaders }));
  log(orders.orders.length === 1 && orders.orders[0].order_number === orderNumber, "orders list has seeded order", `n=${orders.orders.length}`);
  const detail = await j(await fetch(`${BASE}/api/customer/orders/${orderId}`, { headers: myHeaders }));
  log(detail.order && detail.items.length === 1 && detail.shipments.length === 1 && detail.tracking.length === 2, "order detail has items+shipment+tracking", `items=${detail.items.length} trk=${detail.tracking.length}`);
  const detailAnon = await fetch(`${BASE}/api/customer/orders/${orderId}`);
  log(detailAnon.status === 401, "order detail (signed out) 401");

  // ---------- password change ----------
  const pw = await fetch(`${BASE}/api/customer/password`, { method: "PUT", headers: { "Content-Type": "application/json", ...myHeaders }, body: JSON.stringify({ currentPassword: PASSWORD, newPassword: "NewPass2027!" }) });
  log(pw.status === 200, "password change ok");
  const re = await fetch(`${BASE}/api/customer/auth/signin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: "NewPass2027!" }) });
  log(re.status === 200, "signin with new password");
  const reOld = await fetch(`${BASE}/api/customer/auth/signin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  log(reOld.status === 401, "old password rejected after change");

  // ---------- browser: protected route + account pages ----------
  const anon = await openTab(`${BASE}/en/account/orders`);
  const anonPath = await evalJs(anon.cdp, "location.pathname");
  log(anonPath === "/en/signin", "GET /en/account (signed out) -> /en/signin", `path=${anonPath}`);
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${anon.id}`); } catch {}
  try { anon.cdp.ws.close(); } catch {}

  // Sign in via the login form to get the session in the browser profile
  const signinTab = await openTab(`${BASE}/en/signin`);
  await setInput(signinTab.cdp, "#si-email", EMAIL);
  await setInput(signinTab.cdp, "#si-password", "NewPass2027!");
  await evalJs(signinTab.cdp, "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes('Sign in'));b?.click();return true})()");
  await sleep(2500);
  const afterSignin = await evalJs(signinTab.cdp, "location.pathname");
  log(afterSignin.startsWith("/en/account"), "sign-in form -> /en/account", `path=${afterSignin}`);
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${signinTab.id}`); } catch {}
  try { signinTab.cdp.ws.close(); } catch {}

  const acc = await openTab(`${BASE}/en/account/orders`);
  await sleep(1500);
  const bodyText = await evalJs(acc.cdp, "document.body.innerText");
  log(bodyText.includes(orderNumber), "account orders page renders seeded order", `hasNumber=${bodyText.includes(orderNumber)}`);
  const hasTable = (await evalJs(acc.cdp, "document.querySelectorAll('.acc-table').length")) >= 1;
  log(hasTable, "account orders page renders table");
  log(acc.errors.length === 0, "account orders no console errors", acc.errors.slice(0, 2).join("; "));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${acc.id}`); } catch {}
  try { acc.cdp.ws.close(); } catch {}

  const det = await openTab(`${BASE}/en/account/orders/${orderId}`);
  await sleep(1500);
  const detText = await evalJs(det.cdp, "document.body.innerText");
  log(detText.includes(orderNumber) && detText.includes("TRK-123456"), "order detail renders number + tracking placeholder");
  const hasTimeline = (await evalJs(det.cdp, "document.querySelectorAll('.acc-timeline li').length")) >= 2;
  log(hasTimeline, "shipment-status timeline placeholder rendered");
  log(det.errors.length === 0, "order detail no console errors", det.errors.slice(0, 2).join("; "));
  try { await fetch(`http://127.0.0.1:${PORT}/json/close/${det.id}`); } catch {}
  try { det.cdp.ws.close(); } catch {}
} catch (e) {
  failures++;
  console.log("ERROR:", e.message);
} finally {
  await killChromeTree({ port: PORT, profile });
}
console.log(`\nphase7 ${EMAIL}`);
console.log(failures === 0 ? "phase7: ALL OK" : `phase7: ${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
