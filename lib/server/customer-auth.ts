import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { q } from "./db";

export const CUSTOMER_COOKIE = "arem_customer_session";
export const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const AUD = "arem-customer";

function secret(): string {
  const s = process.env.CUSTOMER_SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  if (s.length < 32) throw new Error("SESSION_SECRET too short (min 32 chars)");
  return s;
}

function hmac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function signCustomerSession(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ e: email, exp: now + CUSTOMER_SESSION_MAX_AGE, iat: now, aud: AUD, jti: randomUUID() }),
  ).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifyCustomerSession(token: string | undefined | null): string | null {
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
    if (data.aud !== AUD) return null;
    if (typeof data.jti !== "string" || !data.jti) return null;
    return typeof data.e === "string" ? data.e : null;
  } catch {
    return null;
  }
}

export async function getCustomerEmail(): Promise<string | null> {
  const store = await cookies();
  return verifyCustomerSession(store.get(CUSTOMER_COOKIE)?.value);
}

export async function getCustomerProfileId(email: string): Promise<string | null> {
  const rows = await q<{ id: string }>("select id from public.customer_profiles where email = $1", [email]);
  return rows[0]?.id ?? null;
}

/** Throws when the request is not an authenticated customer. Returns the customer profile. */
export async function requireCustomer(): Promise<{ email: string; id: string }> {
  const email = await getCustomerEmail();
  if (!email) throw new Error("Unauthorized");
  const rows = await q<{ id: string }>("select id from public.customer_profiles where email = $1", [email]);
  if (rows.length === 0) throw new Error("Unauthorized");
  return { email, id: rows[0].id };
}
