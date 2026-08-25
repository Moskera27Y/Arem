import { NextResponse } from "next/server";
import { listCollections } from "@/lib/server/collections";

export const dynamic = "force-dynamic";

/** Public active collections, ordered. */
export async function GET() {
  try {
    const rows = await listCollections({ activeOnly: true });
    return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("list collections error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
