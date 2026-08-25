import { redirect } from "next/navigation";
import { getCustomerEmail, getCustomerProfileId } from "@/lib/server/customer-auth";
import { getProfile } from "@/lib/server/customer-db";
import { ProfileForm } from "@/components/customer/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const email = await getCustomerEmail();
  if (!email) redirect(`/${locale}/signin`);
  const id = await getCustomerProfileId(email);
  if (!id) redirect(`/${locale}/signin`);
  const profile = await getProfile(id);
  if (!profile) redirect(`/${locale}/signin`);
  return <ProfileForm profile={profile} />;
}
