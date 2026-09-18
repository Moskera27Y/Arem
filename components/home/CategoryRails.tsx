import Link from "next/link";
import { getActiveProducts, getCategories, getProductsByCategory } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/cards/ProductCard";
import { DragScroll } from "@/components/ui/DragScroll";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/icons";

interface CategoryRailsProps {
  section: Extract<HomeSection, { kind: "category-rails" }>;
  locale: Locale;
}

/**
 * Signature crafts — one Khoi-style product rail per top category
 * (top 3 by active product count), each with its own view-all.
 */
export function CategoryRails({ section, locale }: CategoryRailsProps) {
  const dict = getDictionary(locale);
  const all = getActiveProducts(locale);
  const top = getCategories(locale)
    .map((category) => ({
      category,
      count: all.filter((p) => p.categoryIds.includes(category.id)).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <section className="section section--products">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            subtitle={section.subtitle}
            center
          />
        </Reveal>
      </div>
      {top.map(({ category }) => {
        const items = getProductsByCategory(locale, category.id).slice(0, 6);
        if (items.length === 0) return null;
        return (
          <div key={category.id} className="category-rail">
            <div className="container category-rail__head">
              <h3 className="h3">{category.shortName}</h3>
              <Link href={`/${locale}/shop?category=${category.slug}`} className="text-link">
                {dict.common.viewAll} <Icon name="arrow-right" size={13} />
              </Link>
            </div>
            <DragScroll className="products-row" aria-label={category.shortName}>
              {items.map((product, i) => (
                <Reveal key={product.id} delay={Math.min(i, 5) * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
              <div className="products-row__cta">
                <Link
                  href={`/${locale}/shop?category=${category.slug}`}
                  className="btn btn--secondary btn--sm"
                >
                  {dict.common.viewAll} <Icon name="arrow-right" size={14} />
                </Link>
              </div>
            </DragScroll>
          </div>
        );
      })}
    </section>
  );
}
