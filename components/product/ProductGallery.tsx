"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { useMediaMap } from "@/lib/admin/storefront-hooks";
import { Icon } from "@/components/ui/icons";

interface ProductGalleryProps {
  images: ImageRef[];
  name: string;
}

/**
 * Product gallery — main image with previous/next controls, thumbnail
 * previews, keyboard support, touch swipe on mobile, and a subtle crossfade
 * between images. Aspect ratio is fixed to avoid layout shift. Gallery
 * images are media-managed (replaceable from the Admin Media library).
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Resolve any managed media replacements (persistent Neon media) keyed by
  // the original content src.
  const mediaMap = useMediaMap();
  const resolveSrc = (src: string) => mediaMap.get(src)?.src ?? src;

  const count = images.length;
  if (count === 0) return null;

  const wrap = useCallback((index: number) => (index + count) % count, [count]);
  const goNext = useCallback(() => setActive((a) => wrap(a + 1)), [wrap]);
  const goPrev = useCallback(() => setActive((a) => wrap(a - 1)), [wrap]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  const current = images[active];
  const currentSrc = resolveSrc(current.src);

  return (
    <div className="gallery">
      <div className="gallery__main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentSrc}
          className="gallery__main-img"
          src={currentSrc}
          alt={current.alt}
          decoding="async"
          fetchPriority="high"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              className="gallery__nav gallery__nav--prev"
              aria-label="Previous image"
              onClick={goPrev}
            >
              <Icon name="chevron-down" size={18} />
            </button>
            <button
              type="button"
              className="gallery__nav gallery__nav--next"
              aria-label="Next image"
              onClick={goNext}
            >
              <Icon name="chevron-down" size={18} />
            </button>
            <span className="gallery__counter">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="gallery__thumbs" role="tablist" aria-label={`${dict.product.galleryNote} — images`}>
          {images.map((image, index) => {
            const src = resolveSrc(image.src);
            return (
              <button
                key={image.src}
                type="button"
                className="gallery__thumb"
                role="tab"
                aria-selected={index === active}
                data-active={index === active}
                aria-label={`${dict.a11y.viewImage} ${index + 1}: ${image.caption ?? image.alt}`}
                onClick={() => setActive(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" />
              </button>
            );
          })}
        </div>
      )}

      {current.caption && (
        <p className="muted gallery__caption" style={{ fontSize: "var(--text-xs)", fontStyle: "italic" }}>
          {current.caption}
        </p>
      )}
      <p className="muted" style={{ fontSize: "var(--text-xs)" }}>
        {dict.product.galleryNote}
      </p>
    </div>
  );
}
