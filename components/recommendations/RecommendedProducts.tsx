"use client";

import Link from "next/link";
import { useRecommendations } from "@/lib/recommendations/use-recommendations";
import type { Product } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCurrency } from "@/lib/currency/currency-context";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";
import type { RecType } from "@/lib/recommendations/use-recommendations";

interface RecommendedProductsProps {
  /** The seed product ID to find similar items for */
  productId?: string;
  /** The category ID to recommend from */
  categoryId?: string;
  /** How many products to fetch (default 4, max 8) */
  limit?: number;
  /** IDs to exclude from results */
  exclude?: string[];
  /** Recommendation strategy */
  type?: RecType;
  locale: Locale;
}

/**
 * RecommendedProducts — renders a rail of product cards driven by the
 * hybrid recommendation engine. Falls back to best-sellers-style placeholders
 * when loading or error states occur.
 *
 * Copy is contextual: "Similar pieces" when seeded by a product,
 * "More like this" on PDP, "From this craft" on category pages.
 */
export function RecommendedProducts({
  productId,
  categoryId,
  limit = 4,
  exclude = [],
  type = productId ? "similar" : "popular",
  locale,
}: RecommendedProductsProps) {
  const dict = getDictionary(locale);
  const { format } = useCurrency();
  const { products, loading, error } = useRecommendations(locale, type, {
    productId,
    categoryId,
    limit,
    exclude,
  });

  // Contextual eyebrow text based on recommendation source
  const getEyebrow = (): string => {
    if (type === "similar") {
      return dict.recommendations.similar;
    }
    if (type === "category") {
      return dict.recommendations.fromCraft;
    }
    return dict.recommendations.favorites;
  };

  if (error) {
    return (
      <p className="muted" style={{ fontSize: "0.875rem", padding: "1rem 0" }}>
        {dict.recommendations.loadError}
      </p>
    );
  }

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="section section--recs" aria-label={getEyebrow()}>
      <div className="container">
        <p className="eyebrow recs__kicker">{getEyebrow()}</p>
        <div className="recs__grid">
          {loading
            ? // Skeleton cards while loading
              Array.from({ length: limit }).map((_, i) => (
                <div key={`skel-${i}`} className="recs__skeleton" aria-hidden={loading ? undefined : "true"}>
                  <div className="recs__skeleton-media shimmer" />
                  <div className="recs__skeleton-body">
                    <div className="recs__skeleton-line" style={{ width: "60%" }} />
                    <div className="recs__skeleton-line" style={{ width: "40%", marginTop: "0.5rem" }} />
                  </div>
                </div>
              ))
            : products.map((product) => (
                <article key={product.id} className="recs__card">
                  <Link href={`/${locale}/products/${product.slug}`} className="recs__link">
                    {product.images[0] && (
                      <div className="recs__media">
                        <ManagedImage
                          src={product.images[0].src}
                          alt={product.images[0].alt}
                          width={560}
                          height={700}
                          className="recs__img"
                        />
                      </div>
                    )}
                    <div className="recs__body">
                      <h3 className="recs__name">{product.name}</h3>
                      <p className="recs__tagline">{product.tagline}</p>
                      <div className="recs__price">
                        <span className="price--current">{format(product.price.amount)}</span>
                        {product.compareAtPrice && (
                          <span className="price--was">{format(product.compareAtPrice.amount)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  {product.badge && (
                    <span className="badge badge--sale recs__badge">{product.badge}</span>
                  )}
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
