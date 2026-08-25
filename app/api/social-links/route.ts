import { NextResponse } from "next/server";
import { listSocialLinks, seedSocialLinks } from "@/lib/server/social";

export const dynamic = "force-dynamic";

/** Public active social links, ordered. Auto-seeds defaults on first read. */
export async function GET() {
  try {
    let rows = await listSocialLinks({ activeOnly: true });
    if (rows.length === 0) {
      await seedSocialLinks();
      rows = await listSocialLinks({ activeOnly: true });
    }
    return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("list social links error", err);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
