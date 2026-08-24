import type { SiteConfig, SiteNavLink } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, type Localized } from "@/lib/content/localized";

interface NavLinkSeed {
  label: Localized;
  href: string;
}

/** Bilingual site-configuration seed. */
export interface SiteSeed {
  brandName: string;
  brandTagline: Localized;
  nav: NavLinkSeed[];
  footer: {
    about: Localized;
    columns: { title: Localized; links: NavLinkSeed[] }[];
    contact: { label: Localized; value: Localized }[];
    socials: { label: string; href: string }[];
    bottom: Localized;
  };
  currency: "COP";
}

/**
 * Site-wide configuration (navigation, footer) — bilingual.
 * Editable from an Admin panel in a later phase.
 */
export const siteSeed: SiteSeed = {
  brandName: "AREM",
  brandTagline: L("World · Colombia", "World · Colombia"),
  nav: [
    { label: L("Shop", "Tienda"), href: "/shop" },
    { label: L("Collections", "Colecciones"), href: "/collections" },
    { label: L("Stories", "Historias"), href: "/stories" },
    { label: L("Regions", "Regiones"), href: "/regions" },
    { label: L("About", "Nosotros"), href: "/about" },
    { label: L("Contact", "Contacto"), href: "/contact" },
  ],
  footer: {
    about: L(
      "AREM WORLD curates the best of Colombian craftsmanship — from Wayuu mochilas of La Guajira to the clay of Ráquira — and brings it to the world with care, transparency and pride.",
      "AREM WORLD selecciona lo mejor del oficio colombiano — de las mochilas wayuu de La Guajira al barro de Ráquira — y lo lleva al mundo con cuidado, transparencia y orgullo.",
    ),
    columns: [
      {
        title: L("Explore", "Explorar"),
        links: [
          { label: L("Shop all", "Tienda completa"), href: "/shop" },
          { label: L("Collections", "Colecciones"), href: "/collections" },
          { label: L("Stories", "Historias"), href: "/stories" },
          { label: L("Regions", "Regiones"), href: "/regions" },
        ],
      },
      {
        title: L("Brand", "Marca"),
        links: [
          { label: L("About us", "Nosotros"), href: "/about" },
          { label: L("Contact", "Contacto"), href: "/contact" },
          { label: L("Wishlist", "Favoritos"), href: "/wishlist" },
          { label: L("Cart", "Carrito"), href: "/cart" },
        ],
      },
      {
        title: L("Help", "Ayuda"),
        links: [
          { label: L("Shipping & returns", "Envíos y devoluciones"), href: "/contact" },
          { label: L("Care guide", "Guía de cuidados"), href: "/stories" },
          { label: L("FAQ", "Preguntas frecuentes"), href: "/contact" },
          { label: L("Privacy", "Privacidad"), href: "/about" },
        ],
      },
    ],
    contact: [
      { label: L("Email", "Correo"), value: L("hola@arem.world", "hola@arem.world") },
      { label: L("WhatsApp", "WhatsApp"), value: L("+57 300 123 4567", "+57 300 123 4567") },
      { label: L("Bogotá · Colombia", "Bogotá · Colombia"), value: L("Carrera 7 # 45-12", "Carrera 7 # 45-12") },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
    ],
    bottom: L(
      "© 2026 AREM WORLD. Made with love in Colombia.",
      "© 2026 AREM WORLD. Hecho con amor en Colombia.",
    ),
  },
  currency: "COP",
};

/** Resolve the bilingual seed to a plain site configuration for one locale. */
export function resolveSiteConfig(seed: SiteSeed, locale: Locale): SiteConfig {
  const link = (l: NavLinkSeed): SiteNavLink => ({ label: pick(l.label, locale), href: l.href });
  return {
    brandName: seed.brandName,
    brandTagline: pick(seed.brandTagline, locale),
    nav: seed.nav.map(link),
    footer: {
      about: pick(seed.footer.about, locale),
      columns: seed.footer.columns.map((column) => ({
        title: pick(column.title, locale),
        links: column.links.map(link),
      })),
      contact: seed.footer.contact.map((c) => ({
        label: pick(c.label, locale),
        value: pick(c.value, locale),
      })),
      socials: seed.footer.socials,
      bottom: pick(seed.footer.bottom, locale),
    },
    currency: seed.currency,
  };
}

export const getSiteConfig = (locale: Locale) => resolveSiteConfig(siteSeed, locale);
