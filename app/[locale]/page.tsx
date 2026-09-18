import { notFound } from "next/navigation";
import { getFeaturedProducts, getHomepage } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { SectionRenderer } from "@/components/home/SectionRenderer";
import { Ticker } from "@/components/home/Ticker";
import { SpotlightModal } from "@/components/home/SpotlightModal";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const homepage = getHomepage(locale);
  const [first, ...rest] = homepage.sections;
  const spotlight = getFeaturedProducts(locale)[0] ?? null;
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      {first && <SectionRenderer key={first.id} section={first} locale={locale} />}
      <Ticker items={homepage.announcementItems} />
      <SpotlightModal product={spotlight} locale={locale} />
      {rest.map((section) => (
        <SectionRenderer key={section.id} section={section} locale={locale} />
      ))}
    </>
  );
}
