import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtisansByRegion,
  getProductsByRegion,
  getRegionBySlug,
  getRegions,
} from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { AremImage } from "@/components/ui/AremImage";
import { ProductCard } from "@/components/cards/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/icons";

interface RegionPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const region = getRegionBySlug(locale, slug);
  if (!region) return { title: getDictionary(locale).meta.notFoundRegion };
  return { title: region.name, description: region.description };
}

export async function generateStaticParams() {
  return getRegions("en").flatMap((region) => [
    { locale: "en", slug: region.slug },
    { locale: "es", slug: region.slug },
  ]);
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const region = getRegionBySlug(locale, slug);
  if (!region) notFound();

  const artisans = getArtisansByRegion(locale, region.id);
  const products = getProductsByRegion(locale, region.id);

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs" style={{ marginBottom: "2rem" }}>
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`${localePrefix}/regions`}>{dict.nav.regions}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{region.name}</span>
          </nav>

          <div className="split">
            <div className="split__media">
              <AremImage src={region.image.src} alt={region.image.alt} />
            </div>
            <div>
              <p className="eyebrow split__kicker">{region.department}</p>
              <h1 className="h2 split__title" style={{ fontSize: "clamp(2rem, 4.4vw, 3.2rem)" }}>
                {region.name}
              </h1>
              <div className="split__body">
                <p>{region.description}</p>
              </div>
              <ul className="region-facts" style={{ marginTop: "2rem" }}>
                {region.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {artisans.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <h2 className="h2" style={{ marginBottom: "2rem" }}>
              {dict.regions.handsOf(region.name)}
            </h2>
            <div className="grid grid--auto">
              {artisans.map((artisan) => (
                <Reveal key={artisan.id}>
                  <article className="story-card">
                    <div className="story-card__media" style={{ aspectRatio: "4 / 5" }}>
                      <AremImage src={artisan.image.src} alt={artisan.image.alt} />
                    </div>
                    <div className="story-card__body">
                      <span className="story-card__meta">{artisan.craft}</span>
                      <h3 className="story-card__title">{artisan.name}</h3>
                      <p className="story-card__dek">{artisan.bio.slice(0, 120)}…</p>
                      <Link href={`${localePrefix}/stories`} className="category-card__link" style={{ marginTop: "0.75rem" }}>
                        {dict.common.theirStories} <Icon name="arrow-right" size={13} />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ marginBottom: "2rem" }}>
              {dict.regions.piecesOf(region.name)}
            </h2>
            <div className="grid grid--4">
              {products.map((product, index) => (
                <Reveal key={product.id} delay={index * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
