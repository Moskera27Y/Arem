import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerEmail, getCustomerProfileId } from "@/lib/server/customer-auth";
import { getProfile, listAddresses, listOrders, getWishlistIds } from "@/lib/server/customer-db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AccountOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const email = await getCustomerEmail();
  if (!email) redirect(`/${locale}/signin`);
  const id = await getCustomerProfileId(email);
  if (!id) redirect(`/${locale}/signin`);

  const profile = await getProfile(id);
  const addresses = await listAddresses(id);
  const orders = await listOrders(id);
  const wishlistIds = await getWishlistIds(id);

  const dict = getDictionary(locale);
  const prefix = `/${locale}`;
  const a = dict.account;
  const firstName = profile?.first_name || profile?.email.split("@")[0];
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || firstName;

  const stats = [
    { num: orders.length, lbl: a.orders, href: `${prefix}/account/orders` },
    { num: addresses.length, lbl: a.addresses, href: `${prefix}/account/addresses` },
    { num: wishlistIds.length, lbl: a.wishlist, href: `${prefix}/account/wishlist` },
  ];

  return (
    <>
      <div className="account__heading">
        <h1>{a.overview}</h1>
        <p>
          {a.welcomeBack} {name}.
        </p>
      </div>
      <div className="account__grid">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="account__stat" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
