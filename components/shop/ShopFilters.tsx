"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useAdminStore } from "@/lib/admin/store";
import { Icon } from "@/components/ui/icons";

export interface ShopFilterCategory {
  slug: string;
  name: string;
  count: number;
}

export interface ShopFilterRegion {
  slug: string;
  name: string;
  count: number;
}

interface ShopFiltersProps {
  categories: ShopFilterCategory[];
  regions: ShopFilterRegion[];
  activeSlug: string | null;
  activeRegion: string | null;
  sort: string;
  query: string;
  saleOnly: boolean;
  localePrefix: string;
}

/** Filter sidebar + search + sort. All state lives in the URL (shareable). */
export function ShopFilters({ categories, regions, activeSlug, activeRegion, sort, query, saleOnly, localePrefix }: ShopFiltersProps) {
  const router = useRouter();
  const locale = useLocale();
  const dict = getDictionary(locale);
  const [sheetOpen, setSheetOpen] = useState(false);
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

  const hrefFor = (slug: string | null, nextSort: string, nextQuery: string = query, nextRegion: string | null = activeRegion) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (nextRegion) params.set("region", nextRegion);
    if (nextSort !== "featured") params.set("sort", nextSort);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (saleOnly) params.set("sale", "1");
    const qs = params.toString();
    return `${localePrefix}/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <button
        type="button"
        className="filters-fab"
        aria-expanded={sheetOpen}
        onClick={() => setSheetOpen((v) => !v)}
      >
        <Icon name="search" size={15} />
        {locale === "es" ? "Filtros" : "Filters"}
        {activeSlug && <span className="filters-fab__dot" aria-hidden="true" />}
      </button>
      {sheetOpen && (
        <button
          type="button"
          className="filters-backdrop"
          aria-label={locale === "es" ? "Cerrar filtros" : "Close filters"}
          onClick={() => setSheetOpen(false)}
        />
      )}
      <aside className="filters" aria-label={dict.shop.categories} data-open={sheetOpen}>
        <div className="filter-group">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const v = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value ?? "";
              router.push(hrefFor(activeSlug, sort, v));
            }}
          >
            <label htmlFor="shop-q" className="filter-group__title">
              {locale === "es" ? "Buscar" : "Search"}
            </label>
            <input
              id="shop-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder={locale === "es" ? "café, mochila, barro…" : "coffee, mochila, clay…"}
              className="acc-input"
              onChange={(e) => {
                const v = e.target.value;
                window.clearTimeout((window as unknown as { __shopT?: number }).__shopT);
                (window as unknown as { __shopT?: number }).__shopT = window.setTimeout(() => {
                  router.push(hrefFor(activeSlug, sort, v));
                }, 450);
              }}
            />
          </form>
        </div>
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
        {regions.length > 0 && (
          <div className="filter-group">
            <h2 className="filter-group__title">
              {locale === "es" ? "Región / Territorio" : "Region / Territory"}
            </h2>
            <ul className="filter-list">
              <li>
                <Link
                  href={hrefFor(null, sort, query, null)}
                  className="filter-item"
                  data-active={activeRegion === null}
                >
                  <span>{locale === "es" ? "Todas las regiones" : "All regions"}</span>
                  <span className="filter-item__count">
                    {regions.reduce((sum, r) => sum + r.count, 0)}
                  </span>
                </Link>
              </li>
              {regions.map((region) => (
                <li key={region.slug}>
                  <Link
                    href={hrefFor(activeSlug, sort, query, region.slug)}
                    className="filter-item"
                    data-active={activeRegion === region.slug}
                  >
                    <span>{region.name}</span>
                    <span className="filter-item__count">{region.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          className="btn btn--primary btn--block filters-close"
          onClick={() => setSheetOpen(false)}
        >
          {locale === "es" ? "Ver resultados" : "Show results"}
        </button>
      </aside>
    </>
  );
}
