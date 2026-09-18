"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
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
  const [leaving, setLeaving] = useState(false);

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
    setLeaving(true);
    setTimeout(() => {
      setOpen(false);
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 220);
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

  if (!open || !product) return null;
  const image = product.images[0];
  const es = locale === "es";

  return (
    <div
      className="spot"
      data-leaving={leaving || undefined}
      role="dialog"
      aria-modal="true"
      aria-label={es ? "Producto estrella de la semana" : "Star product of the week"}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="spot__card">
        <button type="button" className="spot__close" aria-label={es ? "Cerrar" : "Close"} onClick={dismiss}>
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
            <ManagedImage src={image.src} alt="" sizes="(max-width: 640px) 100vw, 320px" width={640} height={760} />
          </Link>
        )}
        <div className="spot__body">
          <p className="eyebrow spot__kicker">
            {es ? "Estrella de la semana" : "Star of the week"}
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
              {es ? "Ver producto" : "Shop now"} <Icon name="arrow-right" size={14} />
            </Link>
            <button type="button" className="spot__later" onClick={dismiss}>
              {es ? "Seguir explorando" : "Keep exploring"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
