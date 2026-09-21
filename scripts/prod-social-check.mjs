// Read-only prod check: homepage insta section + footer use configured socials.
import { launchChrome, killChromeTree, sleep } from "./lib/browser.mjs";
const BASE = process.argv[2] ?? "https://arem-mu.vercel.app";
const { chrome, profile, port: PORT } = await launchChrome();
let failures = 0;
const log = (ok, label, extra = "") => { if (!ok) failures++; console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? " :: " + extra : ""}`); };
function connect(wsUrl){return new Promise((res,rej)=>{const ws=new WebSocket(wsUrl);let id=0;const pending=new Map();const listeners=[];ws.onopen=()=>res({ws,send(method,params={}){return new Promise((r,j)=>{const m=++id;pending.set(m,{r,j});ws.send(JSON.stringify({id:m,method,params}))})},on(e,f){listeners.push([e,f])}});ws.onerror=()=>rej(new Error("ws err"));ws.onmessage=(ev)=>{const msg=JSON.parse(ev.data);if(msg.id&&pending.has(msg.id)){const {r,j}=pending.get(msg.id);pending.delete(msg.id);if(msg.error)j(new Error(msg.error.message));else r(msg.result)}else if(msg.method){for(const[e,f]of listeners)if(e===msg.method)f(msg.params)}}})}
async function openTab(url){const res=await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`,{method:"PUT"});const t=await res.json();const cdp=await connect(t.webSocketDebuggerUrl);await cdp.send("Runtime.enable");await cdp.send("Page.enable");for(let i=0;i<60;i++){const {result}=await cdp.send("Runtime.evaluate",{expression:"document.readyState",returnByValue:true});if(result.value==="complete")break;await sleep(200)}await sleep(1800);return {cdp,id:t.id}}
const ev=async(cdp,e)=>(await cdp.send("Runtime.evaluate",{expression:e,returnByValue:true})).result?.value;
try{
  for(let i=0;i<50;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`);if(r.ok)break}catch{};await sleep(400)}
  const t=await openTab(`${BASE}/en/`);
  const link = await ev(t.cdp, "document.querySelector('.insta-follow')?.getAttribute('href') ?? 'NONE'");
  const heading = await ev(t.cdp, "document.querySelector('.insta-head__link')?.getAttribute('href') ?? 'NONE'");
  const handle = await ev(t.cdp, "document.querySelector('.insta-handle')?.textContent.trim() ?? 'NONE'");
  const tile = await ev(t.cdp, "document.querySelector('.insta-tile')?.getAttribute('href') ?? 'NONE'");
  const tiles = await ev(t.cdp, "document.querySelectorAll('.insta-tile').length");
  const footer = await ev(t.cdp, "[...document.querySelectorAll('.footer__socials a')].map(a=>a.getAttribute('href'))");
  log(link === "https://instagram.com/arem.world", "prod insta follow -> configured URL", link);
  log(heading === "https://instagram.com/arem.world", "prod insta heading -> configured URL", heading);
  log(handle === "@arem.world", "prod insta handle", handle);
  log(tile === "https://instagram.com/arem.world", "prod insta tile -> configured URL", tile);
  log(tiles >= 6, "prod insta tiles", `n=${tiles}`);
  log(footer.some((h) => h === "https://instagram.com/arem.world"), "prod footer includes instagram", "");
  try{await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`)}catch{}
  try{t.cdp.ws.close()}catch{}
}catch(e){failures++;console.log("ERROR:",e.message)}finally{await killChromeTree({port:PORT,profile})}
console.log(failures===0?"\nprod-social: ALL OK":`\nprod-social: ${failures} FALLOS`);
process.exit(failures===0?0:1);
