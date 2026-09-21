import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductSlugs } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ProductView } from "@/components/product/ProductView";
import { RecommendedProducts } from "@/components/recommendations/RecommendedProducts";

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

  // The static product is the SSR baseline; ProductView merges Admin edits
  // client-side (including products created only in the Admin panel).
  const staticProduct = getProductBySlug(locale, slug);

  return (
    <>
      <section className="section section--flush-top">
        <div className="container">
          <ProductView product={staticProduct ?? null} slug={slug} />
        </div>
      </section>

      {staticProduct && (
        <section className="section section--flush-top">
          <div className="container">
            <RecommendedProducts
              productId={staticProduct.id}
              locale={locale}
              limit={4}
              exclude={[staticProduct.id]}
            />
          </div>
        </section>
      )}
    </>
  );
}
