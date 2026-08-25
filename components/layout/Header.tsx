"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSiteConfig } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/icons";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const dict = getDictionary(locale);
  const { count, openCart } = useCart();
  const { ids } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  const site = getSiteConfig(locale);
  const localePrefix = `/${locale}`;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const wishlistCount = ids.length;

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="site-header__brand">
            <Logo href={localePrefix} />
          </div>

          <nav className="nav" aria-label="Principal">
            {site.nav.map((link) => (
              <Link
                key={link.href}
                href={`${localePrefix}${link.href}`}
                className="nav-link"
                aria-current={pathname === `${localePrefix}${link.href}` ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <Link href={`${localePrefix}/shop`} className="icon-btn" aria-label={dict.a11y.search} title={dict.a11y.search}>
              <Icon name="search" size={19} />
            </Link>
            <Link href={`${localePrefix}/account`} className="icon-btn" aria-label={dict.account.myAccount} title={dict.account.myAccount}>
              <Icon name="user" size={19} />
            </Link>
            <Link
              href={`${localePrefix}/wishlist`}
              className="icon-btn"
              aria-label={`${dict.a11y.wishlist}${wishlistCount ? ` (${wishlistCount})` : ""}`}
              title={dict.a11y.wishlist}
            >
              <Icon name="heart" size={19} />
              {wishlistCount > 0 && <span className="icon-btn__count">{wishlistCount}</span>}
            </Link>
            <button
              type="button"
              className="icon-btn"
              aria-label={`${dict.a11y.cart}${count ? ` (${count})` : ""}`}
              title={dict.a11y.cart}
              onClick={openCart}
            >
              <Icon name="bag" size={19} />
              {count > 0 && <span className="icon-btn__count">{count}</span>}
            </button>
            <button type="button" className="icon-btn menu-btn" aria-label={dict.a11y.openMenu} onClick={() => setMenuOpen(true)}>
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú">
          <button type="button" className="icon-btn mobile-menu__close" aria-label={dict.a11y.closeMenu} onClick={() => setMenuOpen(false)}>
            <Icon name="close" size={22} />
          </button>
          <Logo href={localePrefix} />
          <nav aria-label="Menú móvil">
            {site.nav.map((link) => (
              <Link key={link.href} href={`${localePrefix}${link.href}`} className="mobile-menu__link">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu__row">
            <Link href={`${localePrefix}/shop`} className="mobile-menu__row-link">
              <Icon name="search" size={15} /> {dict.a11y.search}
            </Link>
            <Link href={`${localePrefix}/account`} className="mobile-menu__row-link">
              <Icon name="user" size={15} /> {dict.account.myAccount}
            </Link>
          </div>
          <div className="mobile-menu__meta">
            <LanguageSwitcher />
            <span>hola@arem.world</span>
            <span>Bogotá · Colombia</span>
            <span>@arem.world</span>
          </div>
        </div>
      )}
    </>
  );
}
