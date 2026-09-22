import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLegalContent } from "@/lib/content/legal";
import { LegalPage } from "@/components/ui/LegalPage";

interface LegalPageProps {
  params: Promise<{ locale: string }>;
}

const titles = {
  en: {
    cookies: "Cookie Policy",
    description: "How AREM WORLD uses cookies and tracking on this site.",
  },
  es: {
    cookies: "Política de Cookies",
    description: "Cómo AREM WORLD usa cookies y tracking en este sitio.",
  },
};

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const t = titles[locale];
  return {
    title: t.cookies,
    description: t.description,
    robots: { index: true, follow: true },
  };
}

export default async function CookiesPage({ params }: LegalPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { cookies, lastUpdated } = getLegalContent(locale);
  return <LegalPage sections={cookies} lastUpdated={lastUpdated} />;
}
