import Link from "next/link";
import { getActiveProducts } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/cards/ProductCard";
import { DragScroll } from "@/components/ui/DragScroll";
import { Icon } from "@/components/ui/icons";

interface SaleRailProps {
  section: Extract<HomeSection, { kind: "sale-rail" }>;
  locale: Locale;
}

/**
 * "Sale items" — horizontal rail of discounted products (compare-at price),
 * Khoi-style: promo eyebrow, product cards, trailing view-all card.
 */
export function SaleRail({ section, locale }: SaleRailProps) {
  const dict = getDictionary(locale);
  const items = getActiveProducts(locale)
    .filter((p) => p.compareAtPrice && p.compareAtPrice.amount > p.price.amount)
    .slice(0, 8);

  if (items.length === 0) return null;

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
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <div className="products-row__cta">
          <Link href={`/${locale}/shop?sale=1`} className="btn btn--secondary btn--sm">
            {dict.common.viewAll} <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </DragScroll>
    </section>
  );
}
