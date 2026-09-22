"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useCart } from "@/lib/store/cart-context";
import { Icon } from "@/components/ui/icons";

export interface ToastData {
  title: string;
  message?: string;
  image?: string;
  actionLabel?: string;
}

export const TOAST_EVENT = "arem:toast";

/** Fire-and-forget toast from anywhere: `toast({ title, image })`. */
export function toast(detail: ToastData) {
  window.dispatchEvent(new CustomEvent<ToastData>(TOAST_EVENT, { detail }));
}

interface ToastItem extends ToastData {
  key: number;
}

/**
 * Global toast stack (bottom center). Polite live region, thumbnail,
 * "view cart" action. Quick-adds toast instead of yanking the drawer.
 */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const { openCart } = useCart();
  const dict = getDictionary(useLocale());
  const reduceMotion = useReducedMotion() ?? false;

  const dismiss = useCallback((key: number) => {
    setItems((list) => list.filter((t) => t.key !== key));
  }, []);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastData>).detail;
      if (!detail?.title) return;
      const key = Date.now() + Math.random();
      setItems((list) => [...list.slice(-2), { ...detail, key }]);
      setTimeout(() => dismiss(key), 4200);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, [dismiss]);

  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <m.div
            key={t.key}
            className="toast"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          >
            {t.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image} alt="" className="toast__img" aria-hidden="true" />
            )}
            <div className="toast__body">
              <p className="toast__title">{t.title}</p>
              {t.message && <p className="toast__message">{t.message}</p>}
              <div className="toast__actions">
                <button type="button" className="toast__link" onClick={() => { dismiss(t.key); openCart(); }}>
                  {t.actionLabel ?? dict.a11y.viewCart}
                </button>
              </div>
            </div>
            <button type="button" className="toast__close" aria-label={dict.a11y.dismiss} onClick={() => dismiss(t.key)}>
              <Icon name="close" size={14} />
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
