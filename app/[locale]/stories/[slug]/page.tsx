import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtisanById,
  getProductsByArtisan,
  getProductsByRegion,
  getRegionById,
  getStories,
  getStoryBySlug,
} from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/format";
import { AremImage } from "@/components/ui/AremImage";
import { ProductCard } from "@/components/cards/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

interface StoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const story = getStoryBySlug(locale, slug);
  if (!story) return { title: getDictionary(locale).meta.notFoundStory };
  return { title: story.title, description: story.dek };
}

export async function generateStaticParams() {
  return getStories("en").flatMap((story) => [
    { locale: "en", slug: story.slug },
    { locale: "es", slug: story.slug },
  ]);
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const story = getStoryBySlug(locale, slug);
  if (!story) notFound();

  const region = getRegionById(locale, story.regionId);
  const artisan = getArtisanById(locale, story.artisanId);
  const artisanProducts = artisan ? getProductsByArtisan(locale, artisan.id).slice(0, 4) : [];
  const regionProducts =
    region && artisanProducts.length === 0 ? getProductsByRegion(locale, region.id).slice(0, 4) : [];

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs" style={{ marginBottom: "2rem" }}>
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`${localePrefix}/stories`}>{dict.nav.stories}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{story.category}</span>
          </nav>

          <article className="article">
            <p className="eyebrow">{story.category}</p>
            <h1 className="article__title">{story.title}</h1>
            <p className="article__dek">{story.dek}</p>
            <div className="article__meta">
              <span>{formatDate(story.date, locale)}</span>
              <span>{story.readTime}</span>
              {region && <Link href={`${localePrefix}/regions/${region.slug}`}>{region.name}</Link>}
            </div>

            <div className="article__media">
              <AremImage src={story.image.src} alt={story.image.alt} />
            </div>

            <div className="article__body">
              {story.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            {artisan && (
              <blockquote className="quote" style={{ marginTop: "3rem" }}>
                <p className="quote__text">“{artisan.quote}”</p>
                <footer className="quote__author">
                  — {artisan.name}, {artisan.craft}
                </footer>
              </blockquote>
            )}

            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
              <Link href={`${localePrefix}/stories`} className="btn btn--secondary">
                ← {dict.stories.backToStories}
              </Link>
            </div>
          </article>
        </div>
      </section>

      {(artisanProducts.length > 0 || regionProducts.length > 0) && (
        <section className="section section--alt">
          <div className="container">
            <h2 className="h2" style={{ marginBottom: "2rem" }}>
              {artisan ? dict.stories.piecesBy(artisan.name) : dict.stories.piecesBy(region?.name ?? "")}
            </h2>
            <div className="grid grid--4">
              {(artisanProducts.length > 0 ? artisanProducts : regionProducts).map((product, index) => (
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
