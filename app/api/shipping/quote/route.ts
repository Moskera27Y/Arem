import { NextRequest, NextResponse } from "next/server";
import { getShippingProvider } from "@/lib/server/shipping/provider";
import { SHIPPING_METHODS } from "@/lib/server/shipping";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** Quote shipping: POST { city, country, postalCode?, weightKg? } -> { rates }. */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "ship-quote"), 30, 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  let body: { city?: string; country?: string; postalCode?: string; weightKg?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const city = String(body.city || "").slice(0, 100);
  const country = String(body.country || "Colombia").slice(0, 100);
  const weightKg = Math.min(Math.max(Number(body.weightKg ?? 1) || 1, 0.1), 50);
  try {
    const provider = getShippingProvider();
    const rates = await provider.getRates(
      { country: process.env.SHIPPING_ORIGIN_COUNTRY ?? "Colombia" },
      { city, country, postalCode: body.postalCode, weightKg },
    );
    return NextResponse.json({ rates, provider: provider.id });
  } catch {
    // Fallback to flat methods scaled by weight (never break checkout).
    const factor = weightKg <= 2 ? 1 : 1 + (weightKg - 2) * 0.15;
    const rates = SHIPPING_METHODS.map((m) => ({
      carrier: "standard",
      service: m.id,
      priceUsd: Math.round(m.priceUsd * factor * 100) / 100,
      estimatedDays: m.id === "express" ? 2 : 5,
    }));
    return NextResponse.json({ rates, provider: "fallback" });
  }
}
