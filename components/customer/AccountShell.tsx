"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notifyAuthChange } from "@/lib/customer/auth-client";
import { Icon, type IconName } from "@/components/ui/icons";

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "overview", icon: "grid" },
  { href: "/account/profile", label: "profile", icon: "user" },
  { href: "/account/addresses", label: "addresses", icon: "globe" },
  { href: "/account/wishlist", label: "wishlist", icon: "heart" },
  { href: "/account/orders", label: "orders", icon: "bag" },
  { href: "/account/security", label: "security", icon: "shield" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const dict = getDictionary(locale);
  const prefix = `/${locale}`;
  const a = dict.account;

  async function signOut() {
    try {
      await fetch("/api/customer/auth/signout", { method: "POST" });
    } catch {
      /* ignore */
    }
    notifyAuthChange();
    router.push(prefix);
    router.refresh();
  }

  return (
    <section className="account">
      <nav className="account__nav" aria-label={a.myAccount}>
        <p className="account__nav-title">{a.myAccount}</p>
        {LINKS.map((l) => (
          <Link key={l.href} href={`${prefix}${l.href}`}>
            <Icon name={l.icon} size={18} />
            {a[l.label as keyof typeof a]}
          </Link>
        ))}
        <button type="button" className="account__nav-signout" onClick={signOut}>
          <Icon name="close" size={18} />
          {a.signOut}
        </button>
      </nav>
      <div className="account__content">{children}</div>
    </section>
  );
}
