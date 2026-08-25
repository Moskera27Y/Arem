import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/server/customer-auth";
import { getProfile } from "@/lib/server/customer-db";

export async function GET() {
  let id: string;
  try {
    ({ id } = await requireCustomer());
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const profile = await getProfile(id);
    return NextResponse.json(profile);
  } catch (err) {
    console.error("me error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
