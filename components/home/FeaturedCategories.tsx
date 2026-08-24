import { getCategoryById } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { DragScroll } from "@/components/ui/DragScroll";

interface FeaturedCategoriesProps {
  section: Extract<HomeSection, { kind: "featured-categories" }>;
  locale: Locale;
}

/**
 * "Shop by category" — a compact horizontal row of circular category crops,
 * scrolling naturally on mobile. Driven by the centralized Categories data.
 */
export function FeaturedCategories({ section, locale }: FeaturedCategoriesProps) {
  const selected = section.categoryIds
    .map((id) => getCategoryById(locale, id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="section section--categories">
      <div className="container">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          center
        />
      </div>
      <DragScroll className="cat-row" aria-label={section.title}>
        {selected.map((category) => (
          <CategoryCard key={category.id} category={category} locale={locale} />
        ))}
      </DragScroll>
    </section>
  );
}
