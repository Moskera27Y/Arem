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
    refunds: "Refund Policy",
    description: "AREM WORLD return and refund policy for handmade Colombian craft.",
  },
  es: {
    refunds: "Política de Reembolsos",
    description: "Política de devoluciones y reembolsos de AREM WORLD para artesanía hecha a mano.",
  },
};

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const t = titles[locale];
  return {
    title: t.refunds,
    description: t.description,
    robots: { index: true, follow: true },
  };
}

export default async function RefundsPage({ params }: LegalPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { refunds, lastUpdated } = getLegalContent(locale);
  return <LegalPage sections={refunds} lastUpdated={lastUpdated} />;
}
