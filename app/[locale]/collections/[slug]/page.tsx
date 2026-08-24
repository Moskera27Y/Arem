import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getProductById, getCollections } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { AremImage } from "@/components/ui/AremImage";
import { ProductCard } from "@/components/cards/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

interface CollectionPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const collection = getCollectionBySlug(locale, slug);
  if (!collection) return { title: getDictionary(locale).meta.notFoundCollection };
  return { title: collection.name, description: collection.description };
}

export async function generateStaticParams() {
  return getCollections("en").flatMap((collection) => [
    { locale: "en", slug: collection.slug },
    { locale: "es", slug: collection.slug },
  ]);
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const collection = getCollectionBySlug(locale, slug);
  if (!collection) notFound();

  const items = collection.productIds
    .map((id) => getProductById(locale, id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs" style={{ marginBottom: "2rem" }}>
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`${localePrefix}/collections`}>{dict.nav.collections}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{collection.name}</span>
          </nav>

          <div className="collection-hero">
            <div className="collection-hero__media">
              <AremImage src={collection.image.src} alt={collection.image.alt} />
            </div>
            <div className="collection-hero__body">
              <p className="eyebrow" style={{ color: "var(--sand)" }}>
                {collection.tagline}
              </p>
              <h1 className="collection-hero__title">{collection.name}</h1>
              <p className="collection-hero__sub">{collection.description}</p>
            </div>
          </div>

          <div
            style={{
              marginTop: "3rem",
              maxWidth: "44rem",
              color: "var(--ink-2)",
              lineHeight: "1.8",
            }}
          >
            <p>{collection.story}</p>
          </div>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container">
          {items.length === 0 ? (
            <p className="muted">{dict.collections.filling}</p>
          ) : (
            <div className="grid grid--4">
              {items.map((product, index) => (
                <Reveal key={product.id} delay={index * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
