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
    terms: "Terms & Conditions",
    description: "Legal terms for using arem.world and purchasing AREM products.",
  },
  es: {
    terms: "Términos y Condiciones",
    description: "Términos legales para usar arem.world y comprar productos AREM.",
  },
};

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const t = titles[locale];
  return {
    title: t.terms,
    description: t.description,
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage({ params }: LegalPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { terms, lastUpdated } = getLegalContent(locale);
  return <LegalPage sections={terms} lastUpdated={lastUpdated} />;
}
