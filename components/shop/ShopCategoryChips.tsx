import Link from "next/link";
import type { ShopFilterCategory } from "@/components/shop/ShopFilters";

interface ShopCategoryChipsProps {
  categories: ShopFilterCategory[];
  activeSlug: string | null;
  total: number;
  allLabel: string;
  navLabel: string;
  localePrefix: string;
}

/**
 * Sticky category shortcut row (mobile-first; hidden on desktop where the
 * filter sidebar lives). Horizontal snap-scroll pills with piece counts.
 */
export function ShopCategoryChips({
  categories,
  activeSlug,
  total,
  allLabel,
  navLabel,
  localePrefix,
}: ShopCategoryChipsProps) {
  return (
    <div className="shop-chips">
      <nav className="shop-chips__track" aria-label={navLabel}>
        <Link
          href={`${localePrefix}/shop`}
          className="shop-chip"
          data-active={activeSlug === null}
        >
          {allLabel} <span className="shop-chip__count">{total}</span>
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`${localePrefix}/shop?category=${c.slug}`}
            className="shop-chip"
            data-active={activeSlug === c.slug}
          >
            {c.name} <span className="shop-chip__count">{c.count}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
