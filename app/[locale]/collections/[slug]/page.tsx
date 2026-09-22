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
  const r = c as unknown as Record<string, unknown>;
  const pickMeta = (base: string): string | undefined => {
    const v = r[`${base}_${locale}`] ?? r[`${base}_en`];
    return typeof v === "string" && v ? v : undefined;
  };
  return { title: pickMeta("name") ?? "", description: pickMeta("description") };
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const prefix = `/${locale}`;

  const c = await getCollectionBySlug(slug);
  if (!c || !c.is_active) notFound();

  // CMS data resolution (not UI copy): locale column with English fallback.
  const row = c as unknown as Record<string, unknown>;
  const pick = (base: string): string => String(row[`${base}_${locale}`] ?? row[`${base}_en`] ?? "");
  const name = pick("name");
  const description = pick("description");
  const story = pick("story");
  const tagline = pick("tagline");
  const imageSrc = c.image_url || c.image_key || "";
  const imageAlt = pick("image_alt");
  const ids = await listProductIdsForCollection(c.id);
  const items = ids.map((id) => getProductById(locale, id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <nav className="breadcrumbs" aria-label={dict.a11y.breadcrumbs} style={{ marginBottom: "2rem" }}>
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
              {items.length > 0 && (
                <p style={{ marginTop: "1.1rem" }}>
                  <span className="badge badge--light">{dict.common.pieces(items.length)}</span>
                </p>
              )}
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
