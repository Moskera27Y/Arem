import { notFound } from "next/navigation";
import { getHomepage } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { SectionRenderer } from "@/components/home/SectionRenderer";
import { AnimatedBackdrop } from "@/components/home/AnimatedBackdrop";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const homepage = getHomepage(locale);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "AREM WORLD",
    description:
      locale === "es"
        ? "Artesanía colombiana para el mundo."
        : "Colombian craft, curated for the world.",
  };
  return (
    <>
      <AnimatedBackdrop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      {homepage.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} locale={locale} />
      ))}
    </>
  );
}
