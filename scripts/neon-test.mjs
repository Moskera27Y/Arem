// Neon + Blob integration test (API layer).
import { readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#") && !l.trim().startsWith("VERCEL_OIDC"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const BASE = env.BASE_URL || "http://localhost:3100";
let failures = 0;
const log = (ok, label, extra = "") => {
  if (!ok) failures++;
  console.log(`[${ok ? "OK " : "FAIL"}] ${label}${extra ? ` :: ${extra}` : ""}`);
};

// 1) Login
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
});
const setCookie = loginRes.headers.get("set-cookie");
const cookie = setCookie ? setCookie.split(";")[0] : "";
log(loginRes.ok && !!cookie, "login admin OK", `status=${loginRes.status} cookie=${!!cookie}`);

// 2) /api/me authenticated
const me = await fetch(`${BASE}/api/me`, { headers: { cookie } }).then((r) => r.json());
log(me.authenticated === true, "/api/me authenticated", JSON.stringify(me));

// 3) /admin with cookie -> 200; without -> redirect login
const adminAuthed = await fetch(`${BASE}/admin`, { headers: { cookie }, redirect: "manual" });
const adminAnon = await fetch(`${BASE}/admin`, { redirect: "manual" });
log(adminAuthed.status === 200, "/admin accesible con sesión", `status=${adminAuthed.status}`);
log(adminAnon.status === 307 && (adminAnon.headers.get("location") || "").includes("/login"), "/admin bloqueado sin sesión", `status=${adminAnon.status} loc=${adminAnon.headers.get("location")}`);

// 4) Private media POST without cookie -> 401
const noAuth = await fetch(`${BASE}/api/media`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "/images/x.svg", url: "/images/x.svg" }),
});
log(noAuth.status === 401, "media POST sin sesión -> 401", `status=${noAuth.status}`);

// 5) Upsert hero via API (authed)
const up = await fetch(`${BASE}/api/media`, {
  method: "POST",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify({ key: "/images/hero-main.svg", url: "/images/brand-1.svg", type: "hero", usage: "Hero · Homepage", alt_en: "Hero image", alt_es: "Imagen hero" }),
});
log(up.ok, "reemplazo hero (upsert) OK", `status=${up.status}`);

const media = await fetch(`${BASE}/api/media`).then((r) => r.json());
const hero = media.find((m) => m.key === "/images/hero-main.svg");
log(hero && hero.url === "/images/brand-1.svg", "hero persistido en Neon", `url=${hero?.url}`);

// 6) Upload to Vercel Blob
const fd = new FormData();
fd.append("file", new Blob(["fake-image-bytes"], { type: "image/png" }), "test.png");
const upRes = await fetch(`${BASE}/api/admin/upload`, { method: "POST", body: fd, headers: { cookie } });
const upBody = await upRes.json().catch(() => ({}));
log(upRes.ok && !!upBody.url, "subida a Vercel Blob OK", `status=${upRes.status} url=${(upBody.url || "").slice(0, 60)}`);

// 7) Persistence counts
log(media.length >= 50, "media rows en Neon", `${media.length}`);

console.log(failures === 0 ? "\nneon+blob API test: ALL OK" : `\nneon+blob API test: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
