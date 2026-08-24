import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { q } from "./db";

export const SESSION_COOKIE = "arem_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function hmac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function signSession(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ e: email, exp })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifySession(token: string | undefined | null): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return typeof data.e === "string" ? data.e : null;
  } catch {
    return null;
  }
}

export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Throws when the request is not an authorized admin. Returns the admin email. */
export async function requireAdmin(): Promise<{ email: string }> {
  const email = await getSessionEmail();
  if (!email) throw new Error("Unauthorized");
  const rows = await q("select email from public.admin_users where email = $1", [email]);
  if (rows.length === 0) throw new Error("Unauthorized");
  return { email };
}
