import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getCollectionBySlug, listProductIdsForCollection } from "@/lib/server/collections";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { ProductCard } from "@/components/cards/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

interface Params { locale: string; slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const c = await getCollectionBySlug(slug);
  if (!c) return { title: getDictionary(locale).meta.notFoundCollection };
  return { title: locale === "es" ? c.name_es : c.name_en, description: locale === "es" ? c.description_es || undefined : c.description_en || undefined };
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const prefix = `/${locale}`;

  const c = await getCollectionBySlug(slug);
  if (!c || !c.is_active) notFound();

  const name = locale === "es" ? c.name_es : c.name_en;
  const description = locale === "es" ? c.description_es || "" : c.description_en || "";
  const story = locale === "es" ? c.story_es || "" : c.story_en || "";
  const tagline = locale === "es" ? c.tagline_es || "" : c.tagline_en || "";
  const imageSrc = c.image_url || c.image_key || "";
  const imageAlt = locale === "es" ? c.image_alt_es || "" : c.image_alt_en || "";
  const ids = await listProductIdsForCollection(c.id);
  const items = ids.map((id) => getProductById(locale, id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs" style={{ marginBottom: "2rem" }}>
            <Link href={prefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`${prefix}/collections`}>{dict.nav.collections}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{name}</span>
          </nav>

          <div className="collection-hero">
            <div className="collection-hero__media">
              {imageSrc ? <ManagedImage src={imageSrc} alt={imageAlt} sizes="(min-width: 1024px) 50vw, 100vw" /> : null}
            </div>
            <div className="collection-hero__body">
              <p className="eyebrow" style={{ color: "var(--sand)" }}>{tagline}</p>
              <h1 className="collection-hero__title">{name}</h1>
              <p className="collection-hero__sub">{description}</p>
            </div>
          </div>

          {story && (
            <div style={{ marginTop: "3rem", maxWidth: "44rem", color: "var(--ink-2)", lineHeight: "1.8" }}>
              <p>{story}</p>
            </div>
          )}
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
