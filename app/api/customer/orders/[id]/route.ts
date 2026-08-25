import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { getOrder } from "@/lib/server/customer-db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: orderId } = await params;
  try {
    const data = await getOrder(id, orderId);
    if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("order detail error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
