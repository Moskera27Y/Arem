"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection, HeroSlide } from "@/lib/types";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";

/** Campaign rotation interval (ms). Keep in sync with --hero-duration. */
const DURATION = 6500;

interface HeroProps {
  section: Extract<HomeSection, { kind: "hero" }>;
  locale: Locale;
}

/**
 * Immersive full-width campaign carousel — editorial serif headlines over
 * large photography, auto-rotating with crossfade + slow zoom, swipeable,
 * pausable and reduced-motion safe. A single slide renders statically.
 */
export function Hero({ section, locale }: HeroProps) {
  const slides: HeroSlide[] = [
    {
      eyebrow: section.eyebrow,
      title: section.title,
      titleAccent: section.titleAccent,
      subtitle: section.subtitle,
      primaryCta: section.primaryCta,
      secondaryCta: section.secondaryCta,
      image: section.image,
    },
    ...section.slides,
  ];
  const count = slides.length;

  const [index, setIndex] = useState(0);
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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
      setCycle((c) => c + 1);
    },
    [count],
  );

  const paused = hover || hidden || !visible || reduceMotion;

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, count, go]);

  const slide = slides[index];
  const TitleTag = index === 0 ? "h1" : "p";

  return (
    <section
      ref={rootRef}
      className="hero"
      data-slides={count}
      data-paused={paused || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setCycle((c) => c + 1);
      }}
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={count > 1 ? section.eyebrow : undefined}
    >
      <div
        className="hero__media"
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
        {slides.map((s, i) => (
          <div key={i} className="hero__slide" data-active={i === index} aria-hidden={i !== index}>
            <ManagedImage
              src={s.image.src}
              alt={s.image.alt}
              priority={i === 0}
              sizes="100vw"
              width={1920}
              height={860}
            />
          </div>
        ))}
      </div>
      <div key={`${index}-${cycle}`} className="hero__content">
        <p className="hero__eyebrow">{slide.eyebrow}</p>
        <TitleTag className="hero__title">
          {slide.title} <em>{slide.titleAccent}</em>
        </TitleTag>
        <p className="hero__sub">{slide.subtitle}</p>
        <div className="hero__actions">
          <Link href={`/${locale}${slide.primaryCta.href}`} className="btn btn--gold-dark btn--lg">
            {slide.primaryCta.label}
          </Link>
          {slide.secondaryCta && (
            <Link href={`/${locale}${slide.secondaryCta.href}`} className="text-link">
              {slide.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
      {count > 1 && (
        <div className="hero__nav">
          <div className="hero__dots" role="tablist" aria-label={section.eyebrow}>
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1} — ${s.title}`}
                className="hero__dot"
                data-active={i === index}
                onClick={() => go(i)}
              >
                {i === index ? <span key={cycle} className="hero__fill" /> : <span />}
              </button>
            ))}
          </div>
          <div className="hero__arrows">
            <button
              type="button"
              className="hero__arrow"
              aria-label={locale === "es" ? "Anterior" : "Previous"}
              onClick={() => go(index - 1)}
            >
              <Icon name="chevron-down" size={16} style={{ transform: "rotate(90deg)" }} />
            </button>
            <button
              type="button"
              className="hero__arrow"
              aria-label={locale === "es" ? "Siguiente" : "Next"}
              onClick={() => go(index + 1)}
            >
              <Icon name="chevron-down" size={16} style={{ transform: "rotate(-90deg)" }} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
