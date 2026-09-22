"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { useCurrency } from "@/lib/currency/currency-context";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";

/** Rotation interval (ms). Keep in sync with --best-duration in globals.css. */
const DURATION = 6000;

interface BestSellersProps {
  section: Extract<HomeSection, { kind: "best-sellers" }>;
  products: Product[];
  locale: Locale;
}

/**
 * Best-sellers roulette — one spotlight product at a time, auto-rotating
 * with direction-aware slide, segmented progress, arrows, dots and swipe.
 * Pauses on hover, offscreen, hidden tab and reduced motion.
 */
export function BestSellers({ section, products, locale }: BestSellersProps) {
  const dict = getDictionary(locale);
  const { format } = useCurrency();
  const count = products.length;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [cycle, setCycle] = useState(0);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (next: number) => {
      const n = ((next % count) + count) % count;
      setDir(n === index ? 0 : n > index || (index === count - 1 && n === 0) ? 1 : -1);
      setIndex(n);
      setCycle((c) => c + 1);
    },
    [index, count],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const paused = hover || hidden || !visible;

  useEffect(() => {
    if (paused || reduceMotion || count < 2) return;
    const t = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, reduceMotion, count, go]);

  if (count === 0) return null;
  const product = products[index];
  const image = product.images[0];
  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section
      ref={rootRef}
      className="section section--best"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        // Resync progress bar with the rotation timer on resume.
        setCycle((c) => c + 1);
      }}
      aria-roledescription="carousel"
      aria-label={section.title}
    >
      <div className="container">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} center />
        <div className="best" data-paused={paused}>
          <div
            key={product.id}
            className="best__media"
            data-dir={dir}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(delta) > 40) go(index + (delta > 0 ? -1 : 1));
              touchX.current = null;
            }}
          >
            {image && (
              <Link
                href={`/${locale}/products/${product.slug}`}
                aria-label={product.name}
                tabIndex={-1}
              >
                <ManagedImage
                  src={image.src}
                  alt={image.alt}
                  className="best__img"
                  sizes="(max-width: 900px) 100vw, 55vw"
                  width={880}
                  height={1100}
                />
              </Link>
            )}
            <span className="best__count" aria-hidden="true">
              {pad(index)}
              <span className="best__total"> / {pad(count - 1)}</span>
            </span>
            {product.badge && <span className="badge badge--sale best__badge">{product.badge}</span>}
          </div>

          <div key={`${product.id}-${cycle}`} className="best__body">
            <p className="eyebrow best__kicker">
              {dict.home.bestSeller(pad(index))}
            </p>
            <h3 className="best__name">
              <Link href={`/${locale}/products/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="best__tagline">{product.tagline}</p>
            <p className="best__price">
              <span>{format(product.price.amount)}</span>
              {product.compareAtPrice && (
                <span className="price--was">{format(product.compareAtPrice.amount)}</span>
              )}
            </p>
            <div className="best__ctas">
              <Link href={`/${locale}/products/${product.slug}`} className="btn btn--primary">
                {dict.home.viewPiece} <Icon name="arrow-right" size={14} />
              </Link>
            </div>
            <div className="best__nav">
              <div className="best__arrows">
                <button
                  type="button"
                  className="icon-action"
                  aria-label={dict.a11y.prev}
                  onClick={() => go(index - 1)}
                >
                  <Icon name="chevron-down" size={16} style={{ transform: "rotate(90deg)" }} />
                </button>
                <button
                  type="button"
                  className="icon-action"
                  aria-label={dict.a11y.next}
                  onClick={() => go(index + 1)}
                >
                  <Icon name="chevron-down" size={16} style={{ transform: "rotate(-90deg)" }} />
                </button>
              </div>
              <div className="best__segs" role="tablist" aria-label={section.title}>
                {products.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${pad(i)} — ${p.name}`}
                    className="best__seg"
                    data-active={i === index}
                    onClick={() => go(i)}
                  >
                    {i === index ? (
                      <span key={cycle} className="best__fill" />
                    ) : (
                      <span className={i < index ? "best__fill best__fill--done" : "best__fill"} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
