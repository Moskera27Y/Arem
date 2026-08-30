// FASE 1 e2e: add to cart -> checkout -> real order + inventory decrement.
import pg from "pg";
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";
const BASE = process.argv[2] ?? "http://localhost:3100";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
function connect(wsUrl){return new Promise((res,rej)=>{const ws=new WebSocket(wsUrl);let id=0;const p=new Map();const l=[];ws.onopen=()=>res({ws,send(method,params={}){return new Promise((r,j)=>{const m=++id;p.set(m,{r,j});ws.send(JSON.stringify({id:m,method,params}))})},on(e,f){l.push([e,f])}});ws.onerror=()=>rej(new Error("ws err"));ws.onmessage=(ev)=>{const msg=JSON.parse(ev.data);if(msg.id&&p.has(msg.id)){const {r,j}=p.get(msg.id);p.delete(msg.id);if(msg.error)j(new Error(msg.error.message));else r(msg.result)}else if(msg.method){for(const[e,f]of l)if(e===msg.method)f(msg.params)}}})}
async function openTab(url){const res=await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`,{method:"PUT"});const t=await res.json();const cdp=await connect(t.webSocketDebuggerUrl);await cdp.send("Runtime.enable");await cdp.send("Page.enable");for(let i=0;i<60;i++){const {result}=await cdp.send("Runtime.evaluate",{expression:"document.readyState",returnByValue:true});if(result.value==="complete")break;await sleep(200)}await sleep(1500);return {cdp,id:t.id}}
const ev=async(cdp,e)=>{const r=await cdp.send("Runtime.evaluate",{expression:e,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result?.value};
const setInput=(cdp,s,v)=>ev(cdp,`(()=>{const el=document.querySelector(${JSON.stringify(s)});if(!el)return false;const x=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;x.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);

try {
  for(let i=0;i<50;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)break}catch{};await sleep(300)}
  // stock before
  const before = await pool.query("select stock from product_inventory where variant_id='caf-alt-grano'");
  console.log("inventory before (caf-alt-grano):", before.rows[0]?.stock);

  // add to cart on PDP (coffee whole bean, variant caf-alt-grano)
  const t = await openTab(`${BASE}/en/products/cafe-organico-altura-quindio`);
  await ev(t.cdp,"(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes('Add to cart'));b?.click();return true})()");
  await sleep(1200);
  // go to checkout
  await ev(t.cdp,"window.location.href='/en/checkout'; true");
  await sleep(2000);
  const title = await ev(t.cdp,"document.body.innerText.includes('Checkout')");
  log(title,"checkout page renders","");
  // fill the form
  await setInput(t.cdp,"input[type=email]", "comprador@example.com");
  const inputs = await ev(t.cdp,"[...document.querySelectorAll('.checkout-col input')].length");
  await setInput(t.cdp,"input[placeholder]","");
  // fill by order: email, phone, firstName, lastName, country, state, city, address...
  const fields = ["input[type=email]","input[type=tel], .acc-form__row input"];
  // simpler: use labels via the form structure — fill all text inputs in order
  await ev(t.cdp,`(()=>{const ins=[...document.querySelectorAll('.checkout-col input:not([type=radio]):not([type=checkbox])')];const vals=["comprador@example.com","+57 300 000 0000","Ana","Gómez","Colombia","Cundinamarca","Bogotá","Calle 10 # 20-30","Apto 501","110111","sin instrucciones"];ins.forEach((el,i)=>{if(i>=vals.length)return;const x=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;x.call(el,vals[i]);el.dispatchEvent(new Event('input',{bubbles:true}))});return true})()`);
  await sleep(300);
  await ev(t.cdp,"(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes('Place order'));b?.click();return true})()");
  await sleep(2600);
  const conf = await ev(t.cdp,"document.body.innerText");
  const orderMatch = conf.match(/AREM-\d+/);
  log(!!orderMatch,"checkout confirmation shows order number", orderMatch?.[0] ?? "none");
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`)}catch{}; try{t.cdp.ws.close()}catch{}

  if (orderMatch) {
    const ord = await pool.query("select id, email, first_name, status, payment_status, total from orders where order_number=$1", [orderMatch[0]]);
    log(ord.rows.length===1,"order persisted in DB", `email=${ord.rows[0]?.email} status=${ord.rows[0]?.status}`);
    const items = await pool.query("select product_name, variant_name, sku, quantity from order_items where order_id=$1", [ord.rows[0]?.id]);
    log(items.rows.length>=1 && items.rows[0]?.variant_name, "order_items snapshot (name/sku)", `${items.rows[0]?.product_name} / ${items.rows[0]?.variant_name}`);
    const after = await pool.query("select stock from product_inventory where variant_id='caf-alt-grano'");
    const beforeStock = Number(before.rows[0]?.stock ?? 0);
    const afterStock = Number(after.rows[0]?.stock ?? 0);
    log(afterStock === beforeStock - 1, "inventory decremented by 1", `before=${beforeStock} after=${afterStock}`);
    // clean up the test order + restore stock
    await pool.query("delete from order_items where order_id=$1", [ord.rows[0]?.id]);
    await pool.query("update product_inventory set stock = stock + 1 where variant_id='caf-alt-grano'");
    await pool.query("delete from orders where id=$1", [ord.rows[0]?.id]);
  }
} catch(e){failures++;console.log("ERROR:",e.message)} finally {await pool.end(); await killChromeTree({port:PORT,profile})}
console.log(failures===0?"\nfase1: ALL OK":`\nfase1: ${failures} FALLOS`);
process.exit(failures===0?0:1);
