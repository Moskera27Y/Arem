import { NextResponse } from "next/server";
import { getCustomerEmail } from "@/lib/server/customer-auth";

/** Lightweight auth probe that always returns 200 (no HTTP error noise on
 * every guest page view). Used by client code to detect sign-in state. */
export async function GET() {
  const email = await getCustomerEmail();
  return NextResponse.json({ authenticated: email !== null, email });
}
