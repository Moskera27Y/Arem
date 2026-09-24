import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { getOrder } from "@/lib/server/customer-db";
import { transitionOrder } from "@/lib/server/orders";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Customer confirms receipt: shipped → delivered (completed).
 * Only the owning account, only from shipped. Notifies + completes.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  let profileId: string;
  try {
    ({ id: profileId } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: orderId } = await params;
  try {
    const data = await getOrder(profileId, orderId);
    if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (data.order.status !== "shipped") {
      return NextResponse.json({ error: "La orden aún no está en envío" }, { status: 400 });
    }
    const result = await transitionOrder(orderId, "deliver");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("confirm receipt error", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
