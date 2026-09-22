"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCurrency } from "@/lib/currency/currency-context";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";

const SEEN_KEY = "arem-spotlight-v1";

interface SpotlightModalProps {
  product: Product | null;
  locale: Locale;
}

/**
 * First-visit spotlight — mini window with the star product of the week.
 * Shows once (localStorage), bottom sheet on mobile, centered card on
 * desktop. Dismisses via close, backdrop, Escape or CTA.
 */
export function SpotlightModal({ product, locale }: SpotlightModalProps) {
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    try {
      if (!window.localStorage.getItem(SEEN_KEY) && product) {
        t = setTimeout(() => setOpen(true), 1400);
      }
    } catch {
      /* storage unavailable — stay quiet */
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [product]);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, dismiss]);

  if (!product) return null;
  const image = product.images[0];
  const dict = getDictionary(locale).spotlight;

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="spot spot--glass"
          role="dialog"
          aria-modal="true"
          aria-label={dict.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, transition: { duration: 0.22 } }}
        >
          <m.div
            className="spot__card"
            initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
        <button type="button" className="spot__close" aria-label={dict.close} onClick={dismiss}>
          <Icon name="close" size={18} />
        </button>
        {image && (
          <Link
            href={`/${locale}/products/${product.slug}`}
            onClick={dismiss}
            tabIndex={-1}
            aria-hidden="true"
            className="spot__media"
          >
            <ManagedImage src={image.src} alt={product.name} sizes="(max-width: 640px) 100vw, 320px" width={640} height={760} />
          </Link>
        )}
        <div className="spot__body">
          <p className="eyebrow spot__kicker">
            {dict.kicker}
          </p>
          <h2 className="spot__name">{product.name}</h2>
          <p className="spot__price">
            <span>{format(product.price.amount)}</span>
            {product.compareAtPrice && (
              <span className="price--was">{format(product.compareAtPrice.amount)}</span>
            )}
          </p>
          <div className="spot__ctas">
            <Link
              href={`/${locale}/products/${product.slug}`}
              onClick={dismiss}
              className="btn btn--primary btn--block"
            >
              {dict.viewPiece} <Icon name="arrow-right" size={14} />
            </Link>
            <button type="button" className="spot__later" onClick={dismiss}>
              {dict.later}
            </button>
          </div>
        </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
