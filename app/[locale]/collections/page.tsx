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
  const items: Collection[] = await Promise.all(
    rows.map(async (c) => ({
      id: c.id,
      slug: c.slug,
      name: locale === "es" ? c.name_es : c.name_en,
      tagline: locale === "es" ? c.tagline_es || "" : c.tagline_en || "",
      description: locale === "es" ? c.description_es || "" : c.description_en || "",
      story: locale === "es" ? c.story_es || "" : c.story_en || "",
      image: { src: c.image_url || c.image_key || "", alt: locale === "es" ? c.image_alt_es || "" : c.image_alt_en || "" },
      productIds: await listProductIdsForCollection(c.id),
      featured: c.sort_order === 1,
      order: c.sort_order,
    })),
  );

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={prefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.collections}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.collections.eyebrow}</p>
          <h1 className="page-hero__title">{dict.collections.title}</h1>
          <p className="page-hero__sub">{dict.collections.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <p className="muted">{dict.collections.filling}</p>
          ) : (
            <div className="grid grid--2">
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
