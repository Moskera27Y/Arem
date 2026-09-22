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
    privacy: "Privacy Policy",
    description: "How AREM WORLD collects and uses your data.",
  },
  es: {
    privacy: "Política de Privacidad",
    description: "Cómo AREM WORLD recopila y usa tus datos.",
  },
};

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const t = titles[locale];
  return {
    title: t.privacy,
    description: t.description,
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: LegalPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { privacy, lastUpdated } = getLegalContent(locale);
  return <LegalPage sections={privacy} lastUpdated={lastUpdated} />;
}
