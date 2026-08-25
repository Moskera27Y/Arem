import { redirect } from "next/navigation";
import { getCustomerEmail } from "@/lib/server/customer-auth";
import { AccountShell } from "@/components/customer/AccountShell";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCustomerEmail();
  // Customers must be signed in to see their account.
  if (!email) redirect(`/${locale}/signin`);
  return <AccountShell>{children}</AccountShell>;
}
