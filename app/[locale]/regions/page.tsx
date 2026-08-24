import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegions } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { RegionCard } from "@/components/cards/RegionCard";
import { Reveal } from "@/components/ui/Reveal";

interface RegionsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RegionsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return { title: dict.nav.regions, description: dict.regions.sub };
}

export default async function RegionsPage({ params }: RegionsPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const items = getRegions(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.regions}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.regions.eyebrow}</p>
          <h1 className="page-hero__title">{dict.regions.title}</h1>
          <p className="page-hero__sub">{dict.regions.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--auto">
            {items.map((region, index) => (
              <Reveal key={region.id} delay={index * 70}>
                <RegionCard region={region} locale={locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
