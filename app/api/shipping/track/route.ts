import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/server/db";
import { getShippingProvider } from "@/lib/server/shipping/provider";

export const dynamic = "force-dynamic";

/** Public tracking: GET ?tracking=AREM-XXX -> shipment + timeline. */
export async function GET(req: NextRequest) {
  const tracking = String(req.nextUrl.searchParams.get("tracking") || "").trim().slice(0, 64);
  if (!tracking) return NextResponse.json({ error: "tracking requerido" }, { status: 400 });

  const ships = await q<Record<string, unknown>>(
    `select s.*, o.order_number, o.email from public.shipments s
     join public.orders o on o.id = s.order_id
     where s.tracking_number = $1 limit 1`,
    [tracking],
  );
  if (ships.length === 0) return NextResponse.json({ error: "Guía no encontrada" }, { status: 404 });

  const events = await q<Record<string, unknown>>(
    "select status, description, occurred_at from public.tracking_events where shipment_id = $1 order by occurred_at",
    [(ships[0] as { id: string }).id],
  );

  // Refresh from carrier when data is older than 1h (best effort).
  try {
    const last = ships[0] as { last_tracking_update?: string | null; id: string };
    const stale = !last.last_tracking_update || Date.now() - new Date(last.last_tracking_update).getTime() > 3600_000;
    if (stale) {
      const updates = await getShippingProvider(String((ships[0] as { carrier?: string }).carrier ?? "")).getTracking(tracking);
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

  return NextResponse.json({ shipment: ships[0], events });
}
