import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SaleRail } from "@/components/home/SaleRail";
import { CategoryRails } from "@/components/home/CategoryRails";
import { Craftsmanship } from "@/components/home/Craftsmanship";
import { InstagramSection } from "@/components/home/InstagramSection";
import { Newsletter } from "@/components/home/Newsletter";
import { WhyShop } from "@/components/home/WhyShop";

/**
 * Renders any homepage section from its config for the active locale.
 * Adding a new section kind only requires a new branch here — the homepage
 * data stays the single source of truth, so an Admin can compose and
 * translate pages without code changes.
 */
export function SectionRenderer({ section, locale }: { section: HomeSection; locale: Locale }) {
  switch (section.kind) {
    case "hero":
      return <Hero section={section} locale={locale} />;
    case "featured-categories":
      return <FeaturedCategories section={section} locale={locale} />;
    case "featured-products":
      return <FeaturedProducts section={section} locale={locale} />;
    case "sale-rail":
      return <SaleRail section={section} locale={locale} />;
    case "category-rails":
      return <CategoryRails section={section} locale={locale} />;
    case "why-shop":
      return <WhyShop section={section} />;
    case "craftsmanship":
      return <Craftsmanship section={section} />;
    case "instagram":
      return <InstagramSection section={section} locale={locale} />;
    case "newsletter":
      return <Newsletter section={section} locale={locale} />;
    default:
      return null;
  }
}
