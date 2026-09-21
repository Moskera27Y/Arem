"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { useCurrency } from "@/lib/currency/currency-context";
import { useDiscountFor } from "@/lib/admin/storefront-hooks";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { AddToCart } from "@/components/product/AddToCart";
import { Icon } from "@/components/ui/icons";

interface QuickViewProps {
  product: Product | null;
  locale: Locale;
  onClose: () => void;
}

/**
 * Quick view dialog — image, name, price and full add-to-cart (variants
 * included) without leaving the grid. Focus-safe, Escape/backdrop close.
 */
export function QuickView({ product, locale, onClose }: QuickViewProps) {
  const dict = getDictionary(locale);
  const { format } = useCurrency();
  const discount = useDiscountFor(product);
  const reduceMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!product) return;
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  const image = product?.images[0];
  const displayPrice =
    product && discount
      ? { amount: discount.discountedPrice, currency: product.price.currency }
      : product?.price;

  if (!product) return null;

  // Portal to body: cards live inside transformed ancestors (Reveal's
  // will-change), which would hijack position:fixed otherwise.
  return typeof document === "undefined" ? null : (
    createPortal(
    <AnimatePresence>
      {product && mounted && (
        <m.div
          className="qv qv--glass"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, transition: { duration: 0.18 } }}
        >
          <m.div
            className="qv__card"
            initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
          >
            <button type="button" className="qv__close" aria-label={dict.a11y.closeMenu} onClick={onClose}>
              <Icon name="close" size={18} />
            </button>
            {image && (
              <Link
                href={`/${locale}/products/${product.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="qv__media"
              >
                <ManagedImage src={image.src} alt="" sizes="(max-width: 640px) 100vw, 380px" width={760} height={900} />
              </Link>
            )}
            <div className="qv__body">
              <h2 className="qv__name">
                <Link href={`/${locale}/products/${product.slug}`}>{product.name}</Link>
              </h2>
              {displayPrice && (
                <p className="qv__price">
                  <span>{format(displayPrice.amount)}</span>
                  {product.compareAtPrice && (
                    <span className="price--was">{format(product.compareAtPrice.amount)}</span>
                  )}
                </p>
              )}
              <AddToCart product={product} />
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
    )
  );
}
