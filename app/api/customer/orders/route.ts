import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { listOrders } from "@/lib/server/customer-db";

export async function GET() {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const orders = await listOrders(id);
  return NextResponse.json({ orders });
}
