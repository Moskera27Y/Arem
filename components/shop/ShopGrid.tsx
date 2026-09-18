"use client";

/**
 * Shop product grid — re-resolves the product list from the centralized
 * Admin store (edits, deletions, new products), applies the active sort,
 * and renders the toolbar (count + sort) + grid + empty state. SSR renders
 * the static list; after hydration Admin changes are reflected immediately.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useMergedProducts } from "@/lib/admin/storefront-hooks";
import { ProductCard } from "@/components/cards/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

interface ShopGridProps {
  products: Product[];
  locale: Locale;
  sort: string;
  activeSlug: string | null;
  query: string;
  localePrefix: string;
}

export function ShopGrid({ products, locale, sort, activeSlug, query, localePrefix }: ShopGridProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const merged = useMergedProducts(products, locale);

  const sorted = useMemo(() => {
    const list = [...merged];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        list.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, locale));
        break;
      default:
        list.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return list;
  }, [merged, sort, locale]);

  const sortOptions = [
    { value: "featured", label: dict.shop.sortFeatured },
    { value: "price-asc", label: dict.shop.sortPriceAsc },
    { value: "price-desc", label: dict.shop.sortPriceDesc },
    { value: "name", label: dict.shop.sortName },
  ];

  const hrefFor = (nextSort: string) => {
    const params = new URLSearchParams();
    if (activeSlug) params.set("category", activeSlug);
    if (nextSort !== "featured") params.set("sort", nextSort);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    return `${localePrefix}/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="shop-toolbar">
        <span className="shop-toolbar__count">{dict.common.products(sorted.length)}</span>
        <div className="shop-sort">
          <label htmlFor="shop-sort">{dict.shop.sort}</label>
          <select id="shop-sort" value={sort} onChange={(event) => router.push(hrefFor(event.target.value))}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {sorted.length === 0 ? (
        <p className="muted" style={{ padding: "3rem 0" }}>
          {dict.shop.empty}
        </p>
      ) : (
        <div className="shop-grid">
          {sorted.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index, 8) * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
