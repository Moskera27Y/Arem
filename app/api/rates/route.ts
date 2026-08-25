import { NextResponse } from "next/server";
import { getRates } from "@/lib/server/rates";

export const dynamic = "force-dynamic";

/** Public USD-base exchange rates for display conversion. Never exposes
 * provider secrets — only currency rates + metadata the storefront needs. */
export async function GET() {
  try {
    const res = await getRates();
    return NextResponse.json(res, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (err) {
    console.error("rates error", err);
    return NextResponse.json({ rates: { USD: 1 }, updatedAt: null, source: null }, { status: 500 });
  }
}
