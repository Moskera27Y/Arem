import { redirect } from "next/navigation";
import { getCustomerEmail, getCustomerProfileId } from "@/lib/server/customer-auth";
import { listAddresses } from "@/lib/server/customer-db";
import { AddressBook } from "@/components/customer/AddressBook";

export const dynamic = "force-dynamic";

export default async function AddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const email = await getCustomerEmail();
  if (!email) redirect(`/${locale}/signin`);
  const id = await getCustomerProfileId(email);
  if (!id) redirect(`/${locale}/signin`);
  const addresses = await listAddresses(id);
  return <AddressBook initial={addresses} />;
}
