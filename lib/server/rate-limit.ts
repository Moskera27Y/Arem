import "server-only";
import type { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; reset: number }>();

function sweep(now: number) {
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) {
      if (v.reset <= now) buckets.delete(k);
    }
  }
}

/** In-memory fixed-window limiter (per Vercel instance). Enough against casual abuse. */
export function checkRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const cur = buckets.get(key);
  if (!cur || cur.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (cur.count < limit) {
    cur.count += 1;
    return { ok: true, retryAfter: 0 };
  }
  return { ok: false, retryAfter: Math.ceil((cur.reset - now) / 1000) };
}

export function getClientKey(req: NextRequest, scope: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  return `${scope}:${ip}`;
}
