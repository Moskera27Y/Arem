import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/server/auth";

export async function GET() {
  const email = await getSessionEmail();
  return NextResponse.json({ authenticated: !!email, email });
}
