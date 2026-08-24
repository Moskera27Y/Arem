import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductsByCategory,
  getProductSlugs,
} from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ProductView } from "@/components/product/ProductView";
import { ProductCard } from "@/components/cards/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const product = getProductBySlug(locale, slug);
  if (!product) return { title: getDictionary(locale).meta.notFoundProduct };
  return { title: product.name, description: product.tagline };
}

export async function generateStaticParams() {
  return getProductSlugs().flatMap((slug) => [
    { locale: "en", slug },
    { locale: "es", slug },
  ]);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  // The static product is the SSR baseline; ProductView merges Admin edits
  // client-side (including products created only in the Admin panel).
  const staticProduct = getProductBySlug(locale, slug);

  const category = staticProduct ? staticProduct.categoryIds[0] : undefined;
  const related =
    staticProduct && category
      ? getProductsByCategory(locale, category)
          .filter((p) => p.id !== staticProduct.id)
          .slice(0, 4)
      : [];

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <ProductView product={staticProduct ?? null} slug={slug} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--alt section--flush-top">
          <div className="container">
            <SectionHeading eyebrow={dict.product.relatedEyebrow} title={dict.product.relatedTitle} />
            <div className="grid grid--4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
