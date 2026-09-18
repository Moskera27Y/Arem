"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCart } from "@/lib/store/cart-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { Icon } from "@/components/ui/icons";

interface AddToCartProps {
  product: Product;
}

/**
 * Option/variant selector + add-to-cart. Resolves the matching variant by
 * selected option values; disables sold-out variants and validates stock.
 */
export function AddToCart({ product }: AddToCartProps) {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const { add, openCart } = useCart();
  const { format } = useCurrency();
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const option of product.options) initial[option.id] = option.values[0] ?? "";
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const [added, setAdded] = useState(false);
  const buyRowRef = useRef<HTMLDivElement>(null);

  const variant = useMemo(() => {
    return product.variants.find((v) =>
      product.options.every((option) => v.optionValues[option.id] === selected[option.id]),
    );
  }, [product, selected]);

  const soldOut = !variant || variant.inventory <= 0;
  const stockLeft = variant ? variant.inventory : 0;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!variant || soldOut) return;
    add(product.id, variant.id, quantity);
    e.currentTarget.classList.add("is-added");
    setTimeout(() => e.currentTarget.classList.remove("is-added"), 1200);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  // Sticky buy bar appears once the inline buy row scrolls out of view.
  useEffect(() => {
    const el = buyRowRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="pdp__actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
      {product.options.map((option) => (
        <div key={option.id} role="group" aria-label={option.name}>
          <div className="pdp__option-label">
            <span>
              {option.name}: <strong>{selected[option.id]}</strong>
            </span>
            {variant && <span>{dict.product.available(stockLeft)}</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {option.values.map((value) => {
              const isSelected = selected[option.id] === value;
              const isSoldOut = !product.variants.some(
                (v) =>
                  v.optionValues[option.id] === value &&
                  v.inventory > 0 &&
                  product.options.every(
                    (o) => o.id === option.id || v.optionValues[o.id] === selected[o.id],
                  ),
              );
              return (
                <button
                  key={value}
                  type="button"
                  className="option-btn"
                  data-active={isSelected}
                  data-disabled={isSoldOut}
                  aria-pressed={isSelected}
                  onClick={() => setSelected((prev) => ({ ...prev, [option.id]: value }))}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div ref={buyRowRef} className="pdp__buyrow" style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <div className="cart-line__qty" style={{ padding: "0.7rem 0.4rem" }}>
          <button
            type="button"
            className="qty-btn"
            aria-label={dict.a11y.decreaseQty}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Icon name="minus" size={14} />
          </button>
          <span className="cart-line__qty-val" style={{ minWidth: "2rem" }}>
            {quantity}
          </span>
          <button
            type="button"
            className="qty-btn"
            aria-label={dict.a11y.increaseQty}
            onClick={() => setQuantity((q) => Math.min(stockLeft || 99, q + 1))}
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--lg"
          disabled={soldOut}
          onClick={handleAdd}
          style={{ flex: 1 }}
        >
          {soldOut
            ? dict.product.soldOut
            : `${dict.product.addToCart} · ${variant ? format(variant.price.amount) : ""}`}
        </button>
      </div>

      {variant?.compareAtPrice && (
        <p className="muted" style={{ fontSize: "var(--text-xs)" }}>
          {dict.product.originalPrice} {format(variant.compareAtPrice.amount)}
        </p>
      )}
      <div className="pdp-trust">
        <span className="pdp-trust__item">
          <Icon name="shield" size={14} />
          {locale === "es" ? "Compra segura" : "Secure checkout"}
        </span>
        <span className="pdp-trust__item">
          <Icon name="globe" size={14} />
          {locale === "es" ? "Envío con rastreo" : "Tracked shipping"}
        </span>
        <span className="pdp-trust__item">
          <Icon name="check" size={14} />
          {locale === "es" ? "Hecho a mano" : "Handmade"}
        </span>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {added ? (locale === "es" ? "Agregado al carrito" : "Added to cart") : ""}
      </span>
      {showBar &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="pdp-bar" data-visible={showBar}>
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0].src} alt="" aria-hidden="true" className="pdp-bar__img" />
            )}
            <div className="pdp-bar__info">
              <p className="pdp-bar__name">{product.name}</p>
              <p className="pdp-bar__price">
                {variant ? format(variant.price.amount) : ""}
                {variant && <span className="pdp-bar__variant">{variant.title}</span>}
              </p>
            </div>
            <button
              type="button"
              className="btn btn--primary pdp-bar__cta"
              disabled={soldOut}
              onClick={handleAdd}
              aria-label={`${dict.product.addToCart}: ${product.name}`}
            >
              {soldOut ? dict.product.soldOut : dict.product.addToCart}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
