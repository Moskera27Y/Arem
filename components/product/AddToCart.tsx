"use client";

import { useMemo, useState } from "react";
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

  const variant = useMemo(() => {
    return product.variants.find((v) =>
      product.options.every((option) => v.optionValues[option.id] === selected[option.id]),
    );
  }, [product, selected]);

  const soldOut = !variant || variant.inventory <= 0;
  const stockLeft = variant ? variant.inventory : 0;

  const handleAdd = () => {
    if (!variant || soldOut) return;
    add(product.id, variant.id, quantity);
    openCart();
  };

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

      <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
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
    </div>
  );
}
