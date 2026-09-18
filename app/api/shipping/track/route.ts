import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/server/db";
import { getShippingProvider } from "@/lib/server/shipping/provider";
import { checkRateLimit, getClientKey } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** Public tracking: GET ?tracking=AREM-XXX -> status + timeline.
 * Returns only the minimum fields (no PII) and is rate-limited. */
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(getClientKey(req, "track"), 30, 60 * 1000);
  if (!rl.ok) {
    const res = NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfter));
    return res;
  }
  const tracking = String(req.nextUrl.searchParams.get("tracking") || "").trim().slice(0, 64);
  if (!/^[A-Za-z0-9-]{4,64}$/.test(tracking)) {
    return NextResponse.json({ error: "Guía no encontrada" }, { status: 404 });
  }

  const ships = await q<{ id: string; status: string; carrier: string | null; tracking_number: string; estimated_delivery: string | null; last_tracking_update: string | null; order_number: string }>(
    `select s.id, s.status, s.carrier, s.tracking_number, s.estimated_delivery, s.last_tracking_update, o.order_number
     from public.shipments s
     join public.orders o on o.id = s.order_id
     where s.tracking_number = $1 limit 1`,
    [tracking],
  );
  if (ships.length === 0) return NextResponse.json({ error: "Guía no encontrada" }, { status: 404 });

  const events = await q<Record<string, unknown>>(
    "select status, description, occurred_at from public.tracking_events where shipment_id = $1 order by occurred_at limit 50",
    [ships[0].id],
  );

  // Refresh from carrier when data is older than 1h (best effort).
  try {
    const last = ships[0];
    const stale = !last.last_tracking_update || Date.now() - new Date(last.last_tracking_update).getTime() > 3600_000;
    if (stale) {
      const updates = await getShippingProvider(last.carrier ?? "").getTracking(tracking);
      for (const u of updates.slice(-3)) {
        await q("insert into public.tracking_events (shipment_id, status, description, occurred_at) values ($1,$2,$3,$4)", [
          last.id,
          String(u.status).slice(0, 64),
          [u.description, u.location].filter(Boolean).join(" — ").slice(0, 500),
          u.occurredAt,
        ]).catch(() => {});
      }
      await q("update public.shipments set last_tracking_update = now() where id = $1", [last.id]).catch(() => {});
    }
  } catch {
    /* carrier refresh is best-effort */
  }

  const { id, ...shipment } = ships[0];
  void id;
  return NextResponse.json({ shipment, events });
}
