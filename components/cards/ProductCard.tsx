"use client";

import Link from "next/link";
import { getCategoryById, getRegionById, type Product } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useMergedProduct, useDiscountFor } from "@/lib/admin/storefront-hooks";
import { discountPercent } from "@/lib/format";
import { useCurrency } from "@/lib/currency/currency-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { useCart } from "@/lib/store/cart-context";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * Product card — resolves the live product from the centralized Admin store
 * (name, price, status, deletion), applies active promotion discounts, and
 * exposes wishlist + quick-add-to-cart affordances.
 */
export function ProductCard({ product, priority }: ProductCardProps) {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const { has, toggle } = useWishlist();
  const { add, openCart } = useCart();
  const { format, isEstimate } = useCurrency();

  const merged = useMergedProduct(product, locale);
  const discount = useDiscountFor(merged ?? product);

  if (!merged) return null; // deleted from the catalog

  const isWished = has(product.id);
  const category = getCategoryById(locale, merged.categoryIds[0] ?? "");
  const region = getRegionById(locale, merged.regionId);
  const percent = discountPercent(merged.price, merged.compareAtPrice);
  const image = merged.images[0];

  const displayPrice = discount ? { amount: discount.discountedPrice, currency: merged.price.currency } : merged.price;
  const comparePrice = discount ? merged.price : merged.compareAtPrice;
  const saleBadge = discount?.badge ?? (merged.badge ?? null);

  const quickAdd = () => {
    const variant = merged.variants[0];
    if (!variant || variant.inventory <= 0) return;
    add(merged.id, variant.id, 1);
    openCart();
  };

  return (
    <article className="product-card">
      <div className="product-card__media">
        {image && (
          <Link href={`/${locale}/products/${merged.slug}`} aria-label={merged.name} tabIndex={-1}>
            <ManagedImage src={image.src} alt={image.alt} priority={priority} />
          </Link>
        )}
        <div className="product-card__badges">
          {saleBadge && <span className="badge badge--sale">{saleBadge}</span>}
          {percent !== null && discount === null && <span className="badge badge--dark">-{percent}%</span>}
          {!saleBadge && !(percent !== null && discount === null) && (
            <span className="badge badge--new">{dict.product.newBadge}</span>
          )}
        </div>
        <button
          type="button"
          className="wishlist-btn"
          data-active={isWished}
          aria-pressed={isWished}
          aria-label={isWished ? dict.a11y.removeFromWishlist : dict.a11y.addToWishlist}
          onClick={() => toggle(product.id)}
        >
          <Icon name={isWished ? "heart" : "heart"} size={17} strokeWidth={isWished ? 2.2 : 1.8} />
        </button>
      </div>

      <div className="product-card__body">
        {category && <span className="product-card__category">{category.shortName}</span>}
        <h3 className="product-card__title">
          <Link href={`/${locale}/products/${merged.slug}`}>{merged.name}</Link>
        </h3>
        <div className="product-card__price">
          <span>{format(displayPrice.amount)}</span>
          {comparePrice && <span className="price--was">{format(comparePrice.amount)}</span>}
        </div>
        {isEstimate && (
          <p className="currency-note">{locale === "es" ? "Conversión estimada." : "Estimated conversion."}</p>
        )}
        {region && (
          <span className="product-card__origin">
            <Icon name="star" size={11} strokeWidth={1.4} />
            {region.name}
          </span>
        )}
        <div className="product-card__actions">
          <button
            type="button"
            className="icon-action"
            aria-label={dict.a11y.addToWishlist}
            onClick={() => toggle(product.id)}
          >
            <Icon name={isWished ? "heart" : "heart"} size={15} strokeWidth={isWished ? 2.2 : 1.6} />
          </button>
          <button
            type="button"
            className="icon-action"
            aria-label={dict.product.addToCart}
            onClick={quickAdd}
          >
            <Icon name="bag" size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
