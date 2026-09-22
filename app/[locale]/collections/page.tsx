import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { listCollections, listProductIdsForCollection } from "@/lib/server/collections";
import type { Collection } from "@/lib/types";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

interface P { locale: string }

export async function generateMetadata({ params }: { params: Promise<P> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return { title: dict.nav.collections, description: dict.collections.sub };
}

export default async function CollectionsPage({ params }: { params: Promise<P> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const prefix = `/${locale}`;

  const rows = await listCollections({ activeOnly: true });
  // CMS data resolution (not UI copy): pick the locale column with fallback to English.
  const pick = (row: unknown, base: string): string => {
    const r = row as Record<string, unknown>;
    return String(r[`${base}_${locale}`] ?? r[`${base}_en`] ?? "");
  };
  const items: Collection[] = await Promise.all(
    rows.map(async (c) => ({
      id: c.id,
      slug: c.slug,
      name: pick(c, "name"),
      tagline: pick(c, "tagline"),
      description: pick(c, "description"),
      story: pick(c, "story"),
      image: { src: c.image_url || c.image_key || "", alt: pick(c, "image_alt") },
      productIds: await listProductIdsForCollection(c.id),
      featured: c.sort_order === 1,
      order: c.sort_order,
    })),
  );

  return (
    <>
      <section className="shop-hero">
        <div className="container shop-hero__inner">
          <nav className="breadcrumbs shop-hero__crumbs" aria-label={dict.a11y.breadcrumbs}>
            <Link href={prefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.collections}</span>
          </nav>
          <p className="eyebrow shop-hero__eyebrow">{dict.collections.eyebrow}</p>
          <h1 className="shop-hero__title">{dict.collections.title}</h1>
          <p className="shop-hero__sub">{dict.collections.sub}</p>
          {items.length > 0 && (
            <p className="shop-hero__count">
              <span className="shop-hero__count-pill">{dict.collections.count(items.length)}</span>
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <p className="muted">{dict.collections.filling}</p>
          ) : (
            <div className="grid grid--2 collections-grid">
              {items.map((collection, index) => (
                <Reveal key={collection.id} delay={index * 80}>
                  <CollectionCard collection={collection} locale={locale} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
