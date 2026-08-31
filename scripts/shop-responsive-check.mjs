import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";
const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
function connect(wsUrl){return new Promise((res,rej)=>{const ws=new WebSocket(wsUrl);let id=0;const p=new Map();const l=[];ws.onopen=()=>res({ws,send(method,params={}){return new Promise((r,j)=>{const m=++id;p.set(m,{r,j});ws.send(JSON.stringify({id:m,method,params}))})},on(e,f){l.push([e,f])}});ws.onerror=()=>rej(new Error("ws err"));ws.onmessage=(ev)=>{const msg=JSON.parse(ev.data);if(msg.id&&p.has(msg.id)){const {r,j}=p.get(msg.id);p.delete(msg.id);if(msg.error)j(new Error(msg.error.message));else r(msg.result)}else if(msg.method){for(const[e,f]of l)if(e===msg.method)f(msg.params)}}})}
async function openTab(url,w,h){const res=await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`,{method:"PUT"});const t=await res.json();const cdp=await connect(t.webSocketDebuggerUrl);await cdp.send("Runtime.enable");await cdp.send("Page.enable");await cdp.send("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:1,mobile:w<640});for(let i=0;i<60;i++){const {result}=await cdp.send("Runtime.evaluate",{expression:"document.readyState",returnByValue:true});if(result.value==="complete")break;await sleep(200)}await sleep(1600);return {cdp,id:t.id}}
const ev=async(cdp,e)=>{const r=await cdp.send("Runtime.evaluate",{expression:e,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result?.value};
try{
  for(let i=0;i<50;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)break}catch{};await sleep(300)}
  // 1440px desktop -> 4 columns, wide container
  const d=await openTab(`${BASE}/en/shop`,1440,900);
  const cols1440=await ev(d.cdp,"getComputedStyle(document.querySelector('.shop-grid')).gridTemplateColumns.split(' ').length");
  const cards1440=await ev(d.cdp,"document.querySelectorAll('.product-card').length");
  const sidebar=await ev(d.cdp,"getComputedStyle(document.querySelector('.shop-layout')).gridTemplateColumns.split(' ').length");
  const container=await ev(d.cdp,"Math.round(document.querySelector('.shop-page .container').getBoundingClientRect().width)");
  log(cols1440===4,"1440px: 4 products per row",`cols=${cols1440}`);
  log(cards1440>=8,"1440px: many products rendered",`n=${cards1440}`);
  log(sidebar===2,"desktop: sidebar + catalog layout",`cols=${sidebar}`);
  log(container>=1300,"1440px: wide container fills viewport",`width=${container}`);
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${d.id}`)}catch{}; try{d.cdp.ws.close()}catch{}
  // 1024px -> 3 columns
  const m=await openTab(`${BASE}/en/shop`,1024,800);
  const cols1024=await ev(m.cdp,"getComputedStyle(document.querySelector('.shop-grid')).gridTemplateColumns.split(' ').length");
  log(cols1024===3,"1024px: 3 products per row",`cols=${cols1024}`);
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${m.id}`)}catch{}; try{m.cdp.ws.close()}catch{}
  // 390px mobile -> 2 columns (no regression)
  const mob=await openTab(`${BASE}/en/shop`,390,800);
  const cols390=await ev(mob.cdp,"getComputedStyle(document.querySelector('.shop-grid')).gridTemplateColumns.split(' ').length");
  const overflow=await ev(mob.cdp,"document.documentElement.scrollWidth > window.innerWidth");
  log(cols390===2,"390px: 2 columns preserved",`cols=${cols390}`);
  log(!overflow,"390px: no horizontal overflow",`overflow=${overflow}`);
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${mob.id}`)}catch{}; try{mob.cdp.ws.close()}catch{}
}catch(e){failures++;console.log("ERROR:",e.message)}finally{await killChromeTree({port:PORT,profile})}
console.log(failures===0?"\nshop-responsive: ALL OK":`\nshop-responsive: ${failures} FALLOS`);
process.exit(failures===0?0:1);
