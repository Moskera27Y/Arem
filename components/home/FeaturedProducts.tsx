import Link from "next/link";
import { getFeaturedProducts, getProductById } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/cards/ProductCard";
import { DragScroll } from "@/components/ui/DragScroll";
import { Icon } from "@/components/ui/icons";

interface FeaturedProductsProps {
  section: Extract<HomeSection, { kind: "featured-products" }>;
  locale: Locale;
}

/**
 * "New products" — a polished, centered product carousel/grid, scrollable on
 * smaller screens. Driven by the centralized Products + promotions data.
 */
export function FeaturedProducts({ section, locale }: FeaturedProductsProps) {
  const dict = getDictionary(locale);
  const selected =
    section.productIds.length > 0
      ? section.productIds
          .map((id) => getProductById(locale, id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
      : getFeaturedProducts(locale).slice(0, 6);

  return (
    <section className="section section--products">
      <div className="container">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          center
        />
      </div>
      <DragScroll className="products-row" aria-label={section.title}>
        {selected.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <div className="products-row__cta">
          <Link href={`/${locale}/shop`} className="btn btn--secondary btn--sm">
            {dict.common.viewAll} <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </DragScroll>
    </section>
  );
}
