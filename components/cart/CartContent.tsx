"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductById } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useFreeShippingActive } from "@/lib/admin/storefront-hooks";
import { useCurrency } from "@/lib/currency/currency-context";
import { formatCurrency } from "@/lib/money";
import { useCart } from "@/lib/store/cart-context";
import { Icon } from "@/components/ui/icons";

export function CartContent() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const freeShipping = useFreeShippingActive();
  const { lines, subtotal, setQuantity, remove, clear } = useCart();
  const { format, isEstimate } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section className="section">
      <div className="container">
        {!mounted ? null : lines.length === 0 ? (
          <div className="cart-empty" style={{ padding: "4rem 0" }}>
            <span className="cart-empty__icon">
              <Icon name="bag" size={26} />
            </span>
            <p>{dict.cart.empty}</p>
            <Link href={`${localePrefix}/shop`} className="btn btn--primary">
              {dict.nav.shop}
            </Link>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", gap: "3rem" }}>
            <div>
              <h2 className="h3" style={{ marginBottom: "1.5rem" }}>
                {dict.cart.lines(lines.length)}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {lines.map((line) => {
                  const product = getProductById(locale, line.productId);
                  if (!product) return null;
                  const variant = product.variants.find((v) => v.id === line.variantId);
                  if (!variant) return null;
                  const image = product.images[0] ?? { src: "", alt: "" };
                  const optionLabels = product.options
                    .map((o) => variant.optionValues[o.id])
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <div
                      key={line.variantId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "6rem 1fr auto",
                        gap: "1.25rem",
                        alignItems: "center",
                        paddingBottom: "1.5rem",
                        borderBottom: "1px solid var(--line-soft)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt={image.alt}
                        style={{ width: "6rem", height: "8rem", objectFit: "cover", borderRadius: "var(--r-sm)" }}
                        loading="lazy"
                      />
                      <div>
                        <Link href={`${localePrefix}/products/${product.slug}`} className="cart-line__name" style={{ fontSize: "1.1rem" }}>
                          {product.name}
                        </Link>
                        {optionLabels && <div className="cart-line__variant">{optionLabels}</div>}
                        <div className="cart-line__qty" style={{ marginTop: "0.7rem" }}>
                          <button type="button" className="qty-btn" aria-label={dict.a11y.decreaseQty} onClick={() => setQuantity(line.variantId, line.quantity - 1)}>
                            <Icon name="minus" size={13} />
                          </button>
                          <span className="cart-line__qty-val">{line.quantity}</span>
                          <button type="button" className="qty-btn" aria-label={dict.a11y.increaseQty} onClick={() => setQuantity(line.variantId, line.quantity + 1)}>
                            <Icon name="plus" size={13} />
                          </button>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600 }}>{format(variant.price.amount)}</div>
                        <button type="button" className="cart-line__remove" onClick={() => remove(line.variantId)}>
                          {dict.a11y.remove}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="cart-line__remove" style={{ marginTop: "1.5rem" }} onClick={clear}>
                {dict.cart.clear}
              </button>
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "1.75rem" }}>
              <h2 className="h3" style={{ marginBottom: "1.25rem" }}>
                {dict.cart.summary}
              </h2>
              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>{dict.cart.subtotal}</span>
                  <span>{format(subtotal)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>{dict.cart.shipping}</span>
                  <span>{freeShipping ? dict.cart.freeShipping : dict.cart.shippingNote}</span>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>{dict.cart.total}</span>
                  <span>{format(subtotal)}</span>
                </div>
                {isEstimate && (
                  <p className="currency-note">
                    {locale === "es"
                      ? "Conversión estimada. El pago final se cobra en USD."
                      : "Estimated conversion. Final payment is charged in USD."}
                  </p>
                )}
              </div>
              <div className="cart-summary__row cart-summary__row--total" style={{ marginTop: "0.75rem" }}>
                <span>{locale === "es" ? "Total final (USD)" : "Final total (USD)"}</span>
                <span>{formatCurrency(subtotal, "USD")}</span>
              </div>
              <button type="button" className="btn btn--primary btn--block" style={{ marginTop: "1.5rem" }} disabled>
                {dict.cart.checkoutBtn}
              </button>
              <p className="muted" style={{ fontSize: "var(--text-xs)", textAlign: "center", marginTop: "0.9rem" }}>
                {dict.cart.paymentsNote}
              </p>
              <Link href={`${localePrefix}/shop`} className="btn btn--secondary btn--block" style={{ marginTop: "0.75rem" }}>
                {dict.cart.keepShopping}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
