import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";
const BASE = process.argv[2] ?? "http://localhost:3100";
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
function connect(wsUrl){return new Promise((res,rej)=>{const ws=new WebSocket(wsUrl);let id=0;const p=new Map();const l=[];ws.onopen=()=>res({ws,send(method,params={}){return new Promise((r,j)=>{const m=++id;p.set(m,{r,j});ws.send(JSON.stringify({id:m,method,params}))})},on(e,f){l.push([e,f])}});ws.onerror=()=>rej(new Error("ws err"));ws.onmessage=(ev)=>{const msg=JSON.parse(ev.data);if(msg.id&&p.has(msg.id)){const {r,j}=p.get(msg.id);p.delete(msg.id);if(msg.error)j(new Error(msg.error.message));else r(msg.result)}else if(msg.method){for(const[e,f]of l)if(e===msg.method)f(msg.params)}}})}
async function openTab(url){const res=await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`,{method:"PUT"});const t=await res.json();const cdp=await connect(t.webSocketDebuggerUrl);await cdp.send("Runtime.enable");await cdp.send("Log.enable");await cdp.send("Page.enable");const errors=[];cdp.on("Runtime.exceptionThrown",(p)=>errors.push(p.exceptionDetails?.exception?.description??p.exceptionDetails?.text));cdp.on("Log.entryAdded",(p)=>{if(p.entry?.level==="error")errors.push(p.entry.text)});for(let i=0;i<60;i++){const {result}=await cdp.send("Runtime.evaluate",{expression:"document.readyState",returnByValue:true});if(result.value==="complete")break;await sleep(200)}await sleep(1500);return {cdp,id:t.id,errors}}
const ev=async(cdp,e)=>{const r=await cdp.send("Runtime.evaluate",{expression:e,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result?.value};
const setInput=(cdp,s,v)=>ev(cdp,`(()=>{const el=document.querySelector(${JSON.stringify(s)});if(!el)return false;const x=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;x.call(el,${JSON.stringify(v)});el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
async function adminCookie(){const lr=await fetch(`${BASE}/api/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})});return lr.headers.get("set-cookie")?.split(";")[0]??""}

try {
  for(let i=0;i<50;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)break}catch{};await sleep(300)}

  // public contact reads admin config
  const ct=await openTab(`${BASE}/en/contact`);
  const ctText=await ev(ct.cdp,"document.body.innerText");
  log(ctText.includes("hola@arem.world"),"public contact shows email from admin","");
  log(ct.errors.length===0,"contact no console errors",ct.errors.slice(0,1).join("; "));
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${ct.id}`)}catch{}; try{ct.cdp.ws.close()}catch{}

  // public collections list + detail have products
  const cl=await openTab(`${BASE}/en/collections/raiz`);
  const clText=await ev(cl.cdp,"document.body.innerText");
  log(clText.includes("Raíz"),"public collection detail shows name",clText.slice(0,40));
  const prods=await ev(cl.cdp,"document.querySelectorAll('.product-card').length");
  log(prods>0,"public collection shows products",`n=${prods}`);
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${cl.id}`)}catch{}; try{cl.cdp.ws.close()}catch{}

  // admin: contact + collections pages load
  const cookie=await adminCookie();
  const ad=await openTab(`${BASE}/login`);
  await setInput(ad.cdp,"#admin-email",process.env.ADMIN_EMAIL);
  await setInput(ad.cdp,"#admin-password",process.env.ADMIN_PASSWORD);
  await ev(ad.cdp,"(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Entrar');b?.click();return true})()");
  await sleep(1800);
  const ac=await openTab(`${BASE}/admin/contact`);
  await sleep(1000);
  const acText=await ev(ac.cdp,"document.body.innerText");
  log(acText.includes("Contact info"),"admin contact page renders","");
  const acInput=await ev(ac.cdp,"document.querySelector('input[value*=\"hola\"]') !== null");
  log(acInput,"admin contact form pre-filled with email","");
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${ac.id}`)}catch{}; try{ac.cdp.ws.close()}catch{}

  const col=await openTab(`${BASE}/admin/collections`);
  await sleep(1200);
  const colRows=await ev(col.cdp,"document.querySelectorAll('.data-table tbody tr').length");
  log(colRows>=4,"admin collections table shows seeded collections",`rows=${colRows}`);
  const colNav=await ev(col.cdp,"document.body.innerText.includes('Collections')");
  log(colNav,"admin collections nav/page","");
  log(col.errors.length===0,"admin collections no console errors",col.errors.slice(0,1).join("; "));
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${col.id}`)}catch{}; try{col.cdp.ws.close()}catch{}
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${ad.id}`)}catch{}; try{ad.cdp.ws.close()}catch{}

  // change contact email via admin API -> public reflects after refresh
  await fetch(`${BASE}/api/admin/contact`,{method:"PUT",headers:{"Content-Type":"application/json",cookie},body:JSON.stringify({email:"nuevo@arem.world",email_active:true})});
  const ct2=await openTab(`${BASE}/en/contact`);
  const ct2Text=await ev(ct2.cdp,"document.body.innerText");
  log(ct2Text.includes("nuevo@arem.world"),"contact email change reflects on public after refresh","");
  // restore
  await fetch(`${BASE}/api/admin/contact`,{method:"PUT",headers:{"Content-Type":"application/json",cookie},body:JSON.stringify({email:"hola@arem.world",email_active:true})});
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${ct2.id}`)}catch{}; try{ct2.cdp.ws.close()}catch{}
} catch(e){failures++;console.log("ERROR:",e.message)} finally {await killChromeTree({port:PORT,profile})}
console.log(failures===0?"\ncms: ALL OK":`\ncms: ${failures} FALLOS`);
process.exit(failures===0?0:1);
