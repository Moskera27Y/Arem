"use client";

import Link from "next/link";
import type { Category } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { useMergedCategory } from "@/lib/admin/storefront-hooks";
import { ManagedImage } from "@/components/ui/ManagedImage";

interface CategoryCardProps {
  category: Category;
  locale: Locale;
}

/**
 * Circular category chip — resolves the live category from the centralized
 * Admin store (name, image, enabled state) and links to the localized shop
 * route with the category filter.
 */
export function CategoryCard({ category, locale }: CategoryCardProps) {
  const merged = useMergedCategory(category, locale);
  if (!merged) return null;

  return (
    <Link href={`/${locale}/shop?category=${merged.slug}`} className="cat-chip">
      <span className="cat-chip__media">
        <ManagedImage src={merged.image.src} alt={merged.image.alt} />
      </span>
      <span className="cat-chip__name">{merged.shortName}</span>
    </Link>
  );
}
