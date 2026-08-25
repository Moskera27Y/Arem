"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart-context";
import { getProductById } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useFreeShippingActive } from "@/lib/admin/storefront-hooks";
import { useCurrency } from "@/lib/currency/currency-context";
import { Icon } from "@/components/ui/icons";

export function CartDrawer() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const freeShipping = useFreeShippingActive();
  const { lines, isOpen, closeCart, subtotal, setQuantity, remove } = useCart();
  const { format } = useCurrency();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        className="drawer-backdrop"
        data-open={isOpen}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className="drawer" data-open={isOpen} role="dialog" aria-modal="true" aria-label={dict.cart.title}>
        <div className="drawer__head">
          <h2 className="drawer__title">{dict.cart.title}</h2>
          <button type="button" className="icon-btn" aria-label={dict.a11y.closeCart} onClick={closeCart}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon">
              <Icon name="bag" size={26} />
            </span>
            <p>{dict.cart.empty}</p>
            <Link href={`${localePrefix}/shop`} className="btn btn--primary btn--sm" onClick={closeCart}>
              {dict.nav.shop}
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              {lines.map((line) => {
                const product = getProductById(locale, line.productId);
                if (!product) return null;
                const variant = product.variants.find((v) => v.id === line.variantId);
                if (!variant) return null;
                const image = product.images[0] ?? { src: "", alt: "" };
                const optionLabels = product.options
                  .map((option) => variant.optionValues[option.id])
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div className="cart-line" key={line.variantId}>
                    <Link href={`${localePrefix}/products/${product.slug}`} className="cart-line__media" onClick={closeCart}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.src} alt={image.alt} loading="lazy" />
                    </Link>
                    <div>
                      <Link href={`${localePrefix}/products/${product.slug}`} className="cart-line__name" onClick={closeCart}>
                        {product.name}
                      </Link>
                      {optionLabels && <div className="cart-line__variant">{optionLabels}</div>}
                      <div className="cart-line__qty">
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label={dict.a11y.decreaseQty}
                          onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                        >
                          <Icon name="minus" size={13} />
                        </button>
                        <span className="cart-line__qty-val">{line.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label={dict.a11y.increaseQty}
                          onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                        >
                          <Icon name="plus" size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-line__right">
                      <span className="cart-line__price">{format(variant.price.amount)}</span>
                      <button type="button" className="cart-line__remove" onClick={() => remove(line.variantId)}>
                        {dict.a11y.remove}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="drawer__foot">
              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>{dict.cart.subtotal}</span>
                  <span>{format(subtotal)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>{dict.cart.shipping}</span>
                  <span>{freeShipping ? dict.cart.freeShipping : dict.cart.shippingNote}</span>
                </div>
              </div>
              <Link href={`${localePrefix}/cart`} className="btn btn--primary btn--block" onClick={closeCart}>
                {dict.cart.viewFull}
              </Link>
              <p className="muted" style={{ fontSize: "var(--text-xs)", textAlign: "center" }}>
                {dict.cart.checkoutLater}
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
