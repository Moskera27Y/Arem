import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { q } from "@/lib/server/db";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const orders = await q<Record<string, unknown>>(
    `select o.*, cp.email as customer_email,
            (select coalesce(sum(oi.quantity),0) from public.order_items oi where oi.order_id = o.id) as item_count
       from public.orders o
       join public.customer_profiles cp on cp.id = o.customer_profile_id
       order by o.created_at desc`,
  );
  return NextResponse.json({ orders });
}
