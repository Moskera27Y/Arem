import { NextResponse } from "next/server";
import { getContact } from "@/lib/server/site";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contact = await getContact();
    return NextResponse.json(contact, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("get contact error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
