"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useAdminStore } from "@/lib/admin/store";

export interface ShopFilterCategory {
  slug: string;
  name: string;
  count: number;
}

interface ShopFiltersProps {
  categories: ShopFilterCategory[];
  activeSlug: string | null;
  sort: string;
  localePrefix: string;
}

/** Filter sidebar + sort control. Both keep state in the URL (query params). */
export function ShopFilters({ categories, activeSlug, sort, localePrefix }: ShopFiltersProps) {
  const router = useRouter();
  const locale = useLocale();
  const dict = getDictionary(locale);
  const { categories: adminCategories, hydrated } = useAdminStore();

  // Merge Admin category edits (names, visibility, new categories) over the
  // static filter list; counts stay from the server baseline.
  const effectiveCategories = useMemo(() => {
    if (!hydrated || adminCategories.length === 0) return categories;
    const bySlug = new Map(adminCategories.filter((c) => c.enabled !== false).map((c) => [c.slug, c]));
    const merged = categories
      .filter((c) => bySlug.has(c.slug))
      .map((c) => {
        const seed = bySlug.get(c.slug)!;
        const name = locale === "es" ? seed.name.es : seed.name.en;
        return { ...c, name: name || c.name };
      });
    for (const seed of adminCategories) {
      if (seed.enabled === false) continue;
      if (!categories.some((c) => c.slug === seed.slug)) {
        merged.push({ slug: seed.slug, name: locale === "es" ? seed.name.es : seed.name.en, count: 0 });
      }
    }
    return merged;
  }, [categories, adminCategories, hydrated, locale]);

  const sortOptions = [
    { value: "featured", label: dict.shop.sortFeatured },
    { value: "price-asc", label: dict.shop.sortPriceAsc },
    { value: "price-desc", label: dict.shop.sortPriceDesc },
    { value: "name", label: dict.shop.sortName },
  ];

  const hrefFor = (slug: string | null, nextSort: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (nextSort !== "featured") params.set("sort", nextSort);
    const qs = params.toString();
    return `${localePrefix}/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <aside className="filters" aria-label={dict.shop.categories}>
        <div className="filter-group">
          <h2 className="filter-group__title">{dict.shop.categories}</h2>
          <ul className="filter-list">
            <li>
              <Link
                href={hrefFor(null, sort)}
                className="filter-item"
                data-active={activeSlug === null}
              >
                <span>{dict.shop.all}</span>
                <span className="filter-item__count">
                  {effectiveCategories.reduce((sum, c) => sum + c.count, 0)}
                </span>
              </Link>
            </li>
            {effectiveCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={hrefFor(category.slug, sort)}
                  className="filter-item"
                  data-active={activeSlug === category.slug}
                >
                  <span>{category.name}</span>
                  <span className="filter-item__count">{category.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="shop-sort">
        <label htmlFor="shop-sort">{dict.shop.sort}</label>
        <select
          id="shop-sort"
          value={sort}
          onChange={(event) => router.push(hrefFor(activeSlug, event.target.value))}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
