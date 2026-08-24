"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon, type IconName } from "@/components/ui/icons";

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "grid" },
  { href: "/admin/products", label: "Products", icon: "bag" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
  { href: "/admin/promotions", label: "Promotions", icon: "percent" },
  { href: "/admin/social-links", label: "Social links", icon: "link" },
  { href: "/admin/media", label: "Media library", icon: "image" },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin">
      <span className="admin-nav__label">Content</span>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="admin-nav__link"
            data-active={active}
            onClick={onNavigate}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </Link>
        );
      })}
      <span className="admin-nav__label">Storefront</span>
      <a
        href="/en"
        className="admin-nav__link"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        <Icon name="external" size={16} />
        View storefront
      </a>
    </nav>
  );
}

function AdminBrand() {
  return (
    <div className="admin-brand">
      <span className="admin-brand__name">AREM</span>
      <span className="admin-brand__tag">Admin</span>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const pageTitle =
    NAV_ITEMS.find((item) => item.href !== "/admin" && pathname.startsWith(item.href))?.label ??
    (pathname.startsWith("/admin/products") ? "Products" : "Overview");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <AdminBrand />
        <AdminNav />
        <div className="admin-sidebar__foot">
          <Link href={`/${locale}`} className="footer__social" style={{ justifyContent: "center" }}>
            <Icon name="external" size={13} /> Storefront
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button
            type="button"
            className="icon-btn admin-menu-btn"
            aria-label="Open admin menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>
          <span className="admin-topbar__title">{pageTitle}</span>
          <span className="admin-topbar__spacer" />
          <Link href={`/${locale}`} className="btn btn--secondary btn--sm">
            View storefront
          </Link>
        </div>
        <div className="admin-content">{children}</div>
      </div>

      <div className="admin-drawer" data-open={drawerOpen} onClick={() => setDrawerOpen(false)}>
        <div className="admin-drawer__panel" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="admin-drawer__close"
            aria-label="Close admin menu"
            onClick={() => setDrawerOpen(false)}
          >
            <Icon name="close" size={20} />
          </button>
          <AdminBrand />
          <AdminNav onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>
    </div>
  );
}
