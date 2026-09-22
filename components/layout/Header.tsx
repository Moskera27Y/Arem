"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { getSiteConfig } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/icons";
import { ViewTransitionLink } from "@/components/ui/ViewTransitionLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/layout/CurrencySwitcher";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const dict = getDictionary(locale);
  const { count, openCart } = useCart();
  const { ids } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuReady, setMenuReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Set data-open on the mobile menu AFTER the first paint so the CSS
  // staggered link transition (opacity 0 → 1) fires correctly. Without
  // this, m.div renders the menu but data-open is never set, leaving
  // mobile menu links permanently opacity:0 (invisible on cream bg).
  useEffect(() => {
    if (!menuOpen) {
      setMenuReady(false);
      return;
    }
    const raf = requestAnimationFrame(() => setMenuReady(true));
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

  // Scroll state for header gradient — triggers cream→clear fade as hero enters viewport
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const wishlistCount = ids.length;
  const [cartBump, setCartBump] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (count === 0) return;
    setCartBump(true);
    const t = setTimeout(() => setCartBump(false), 400);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <>
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="container site-header__inner">
          <div className="site-header__brand">
            <Logo href={localePrefix} />
          </div>

          <nav className="nav" aria-label="Principal">
            {site.nav.map((link) => (
              <ViewTransitionLink
                key={link.href}
                href={`${localePrefix}${link.href}`}
                className="nav-link"
                aria-current={pathname === `${localePrefix}${link.href}` ? "page" : undefined}
              >
                {link.label}
              </ViewTransitionLink>
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <CurrencySwitcher />
            <Link href={`${localePrefix}/shop`} className="icon-btn icon-btn--search" aria-label={dict.a11y.search} title={dict.a11y.search}>
              <Icon name="search" size={19} />
            </Link>
            <button
              type="button"
              className="icon-btn icon-btn--search-mobile"
              aria-label={dict.a11y.search}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Icon name="search" size={19} />
            </button>
            <Link href={`${localePrefix}/account`} className="icon-btn icon-btn--account" aria-label={dict.account.myAccount} title={dict.account.myAccount}>
              <Icon name="user" size={19} />
            </Link>
            <Link
              href={`${localePrefix}/wishlist`}
              className="icon-btn icon-btn--wishlist"
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
              {count > 0 && (
                <span key={count} className="icon-btn__count" data-bump={cartBump}>
                  {count}
                </span>
              )}
            </button>
            <button type="button" className="icon-btn menu-btn" aria-label={dict.a11y.openMenu} onClick={() => setMenuOpen(true)}>
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="container">
            <form
              role="search"
              className="header-search"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                router.push(`${localePrefix}/shop${searchValue.trim() ? `?q=${encodeURIComponent(searchValue.trim())}` : ""}`);
              }}
            >
              <Icon name="search" size={17} />
              <input
                autoFocus
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={locale === "es" ? "Buscar piezas…" : "Search pieces…"}
                aria-label={dict.a11y.search}
                className="header-search__input"
              />
              <button type="button" className="icon-action" aria-label={dict.a11y.closeMenu} onClick={() => setSearchOpen(false)}>
                <Icon name="close" size={15} />
              </button>
            </form>
          </div>
        )}
      </header>

      <AnimatePresence>
        {menuOpen && (
          <m.div
            className="mobile-menu mobile-menu--glass"
            data-open={menuReady}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={reduceMotion ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12, transition: { duration: 0.22 } }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <button type="button" className="icon-btn mobile-menu__close" aria-label={dict.a11y.closeMenu} onClick={() => setMenuOpen(false)}>
              <Icon name="close" size={22} />
            </button>
            <Logo href={localePrefix} variant="light" />
            <nav aria-label="Menú móvil">
              {/* Inicio: acceso directo a casa (el logo no está en la barra móvil) */}
              <ViewTransitionLink href={localePrefix} className="mobile-menu__link mobile-menu__link--home">
                {locale === "es" ? "Inicio" : "Home"}
              </ViewTransitionLink>
              {site.nav.map((link, i) => (
                <ViewTransitionLink key={link.href} href={`${localePrefix}${link.href}`} className="mobile-menu__link" data-i={i}>
                  <span className="mobile-menu__index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </ViewTransitionLink>
              ))}
            </nav>
            <div className="mobile-menu__row">
              <Link href={`${localePrefix}/shop`} className="mobile-menu__row-link">
                <Icon name="search" size={15} /> {dict.a11y.search}
              </Link>
              <Link href={`${localePrefix}/account`} className="mobile-menu__row-link">
                <Icon name="user" size={15} /> {dict.account.myAccount}
              </Link>
              <Link href={`${localePrefix}/wishlist`} className="mobile-menu__row-link">
                <Icon name="heart" size={15} /> {dict.a11y.wishlist}
              </Link>
            </div>
            <div className="mobile-menu__meta">
              <LanguageSwitcher />
              <CurrencySwitcher />
              <span>hola@arem.world</span>
              <span>Bogotá · Colombia</span>
              <span>@arem.world</span>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
