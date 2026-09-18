import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getHomepage } from "@/lib/content";
import { StoreProvider } from "@/lib/store/store-provider";
import { AdminProvider } from "@/lib/admin/store";
import { SetDocumentLang } from "@/components/layout/SetDocumentLang";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// NOTE: dynamicParams is intentionally left at its default (true) so slugs
// created in the Admin panel (which have no static page) render on demand and
// are resolved client-side by the Admin store instead of 404ing.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  return {
    title: {
      default:
        locale === "en"
          ? "AREM WORLD — Colombian craft, curated for the world"
          : "AREM WORLD — Artesanía colombiana para el mundo",
      template: "%s · AREM WORLD",
    },
    description:
      locale === "en"
        ? "AREM WORLD curates the best of Colombian craftsmanship — coffee, mochilas, ceramics, textiles and more — made by hand, told with pride."
        : "AREM WORLD selecciona lo mejor del oficio colombiano — café, mochilas, cerámica, textiles y más — hecho a mano, contado con orgullo.",
    openGraph: {
      title: "AREM WORLD",
      description:
        locale === "en" ? "Colombian craft, curated for the world." : "Artesanía colombiana para el mundo.",
      type: "website",
      locale: locale === "en" ? "en_US" : "es_CO",
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  if (!isLocale(raw)) notFound();

  const homepage = getHomepage(locale);

  return (
    <LocaleProvider locale={locale}>
      <SetDocumentLang locale={locale} />
      <StoreProvider>
        <AdminProvider>
          <AnnouncementBar items={homepage.announcementItems} />
          <Header />
          <main id="main">{children}</main>
          <Footer locale={locale} />
          <CartDrawer />
        </AdminProvider>
      </StoreProvider>
    </LocaleProvider>
  );
}
