"use client";

/**
 * Product detail view — the live PDP body. Resolves the product from the
 * centralized Admin store (edits, deletions, and products created in the
 * Admin panel), applies active promotion pricing, and renders the gallery,
 * variant selector, story and details.
 */

import Link from "next/link";
import {
  getArtisanById,
  getCategoryById,
  getCollectionById,
  getRegionById,
  type Product,
} from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useAdminProductBySlug, useDiscountFor, useMergedProduct } from "@/lib/admin/storefront-hooks";
import { discountPercent } from "@/lib/format";
import { useCurrency } from "@/lib/currency/currency-context";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { Icon } from "@/components/ui/icons";

interface ProductViewProps {
  product: Product | null;
  slug: string;
}

export function ProductView({ product: staticProduct, slug }: ProductViewProps) {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const { format, isEstimate } = useCurrency();

  const merged = useMergedProduct(staticProduct, locale);
  const adminOnly = useAdminProductBySlug(slug, locale);
  const product: Product | null = staticProduct ? merged : adminOnly;
  const discount = useDiscountFor(product);

  if (!product) {
    return (
      <div className="cart-empty" style={{ padding: "5rem 0" }}>
        <span className="cart-empty__icon">
          <Icon name="bag" size={26} />
        </span>
        <h1 className="h2">{dict.meta.notFoundProduct}</h1>
        <p>{dict.notFound.sub}</p>
        <Link href={`${localePrefix}/shop`} className="btn btn--primary">
          {dict.notFound.exploreShop}
        </Link>
      </div>
    );
  }

  const category = getCategoryById(locale, product.categoryIds[0] ?? "");
  const region = getRegionById(locale, product.regionId);
  const artisan = getArtisanById(locale, product.artisanId);
  const percent = discountPercent(product.price, product.compareAtPrice);
  const displayPrice = discount
    ? { amount: discount.discountedPrice, currency: product.price.currency }
    : product.price;
  const comparePrice = discount ? product.price : product.compareAtPrice;

  return (
    <>
      <nav className="breadcrumbs" aria-label={dict.a11y.breadcrumbs} style={{ marginBottom: "2rem" }}>
        <Link href={localePrefix}>{dict.common.home}</Link>
        <span className="breadcrumbs__sep">/</span>
        <Link href={`${localePrefix}/shop`}>{dict.nav.shop}</Link>
        {category && (
          <>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`${localePrefix}/shop?category=${category.slug}`}>{category.shortName}</Link>
          </>
        )}
        <span className="breadcrumbs__sep">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="pdp">
        <ProductGallery images={product.images} name={product.name} />

        <div className="pdp__info">
          <div>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp-rating" aria-label={dict.product.noReviews}>
              <span className="pdp-rating__stars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" size={13} />
                ))}
              </span>
              <span className="pdp-rating__text">
                {dict.product.beFirstReview}
              </span>
            </p>
            <p className="pdp__tagline" style={{ marginTop: "0.6rem" }}>
              {product.tagline}
            </p>
          </div>

          <div className="pdp__price">
            <span>{format(displayPrice.amount)}</span>
            {comparePrice && <span className="price--was">{format(comparePrice.amount)}</span>}
            {discount?.badge && <span className="badge badge--sale">{discount.badge}</span>}
            {percent !== null && !discount && <span className="badge badge--dark">-{percent}%</span>}
            {product.badge && !discount && <span className="badge badge--dark">{product.badge}</span>}
            {isEstimate && (
              <p className="currency-note">{dict.cart.estimatedNote}</p>
            )}
          </div>

          <p className="pdp__desc">{product.description}</p>

          <AddToCart product={product} />

          <div className="pdp__meta">
            {region && (
              <span>
                {dict.product.origin}: {region.name}
              </span>
            )}
            {artisan && (
              <span>
                {dict.product.artisan}: <strong>{artisan.name}</strong>
              </span>
            )}
            {product.collectionIds.length > 0 && (
              <span>
                {dict.product.collections}:{" "}
                {product.collectionIds.map((id, index) => {
                  const collection = getCollectionById(locale, id);
                  if (!collection) return null;
                  return (
                    <span key={id}>
                      {index > 0 && ", "}
                      <Link href={`${localePrefix}/collections/${collection.slug}`}>
                        {collection.name}
                      </Link>
                    </span>
                  );
                })}
              </span>
            )}
            <span>
              {dict.product.sku}: {product.variants[0]?.sku ?? "—"} · {dict.product.inventoryNote}
            </span>
          </div>

          {product.story.length > 0 && (
            <div className="pdp__story">
              <h3>{dict.product.storyTitle}</h3>
              {product.story.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          )}

          {product.details.length > 0 && (
            <details className="pdp-acc" name="pdp-info">
              <summary>{dict.product.detailsTitle}</summary>
              <div className="pdp-acc__body">
                <ul>
                  {product.details.map((detail) => (
                    <li key={detail.slice(0, 24)}>{detail}</li>
                  ))}
                </ul>
              </div>
            </details>
          )}

          <details className="pdp-acc" name="pdp-info">
            <summary>{dict.product.shippingTitle}</summary>
            <div className="pdp-acc__body">
              <p>
                {dict.product.shippingBody}{" "}
                <Link href={`${localePrefix}/tracking`}>
                  {dict.product.trackOrder}
                </Link>
                {" · "}
                <Link href={`${localePrefix}/contact`}>{dict.nav.contact}</Link>
              </p>
            </div>
          </details>

          {artisan && (
            <div className="pdp-editorial pdp-maker">
              <span className="eyebrow">{dict.product.meetMaker}</span>
              <h3>{artisan.name}</h3>
              <p className="pdp-maker__craft">{artisan.craft}</p>
              <p>{artisan.bio}</p>
              {region && <p className="muted">{region.name}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
