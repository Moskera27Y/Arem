"use client";

/**
 * ManagedImage — renders a public storefront image that is controllable from
 * the Admin Media library. Before hydration it renders the passed src/alt
 * (SSR baseline, no mismatch); after hydration it substitutes the managed
 * replacement (src + bilingual alt) so Admin media edits reflect immediately.
 *
 * - Local SVG artwork: plain <img> (Next never optimizes SVG).
 * - Everything else: next/image (AVIF/WebP, responsive sizes, blur-up).
 */

import Image from "next/image";
import { useLocale } from "@/lib/i18n/locale-context";
import { useManagedMedia } from "@/lib/admin/storefront-hooks";

/** Tiny cream shimmer used as blur placeholder (no build step needed). */
const SHIMMER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e9dcc3'/%3E%3C/svg%3E";

interface ManagedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function ManagedImage({ src, alt, className, priority, sizes, width, height }: ManagedImageProps) {
  const locale = useLocale();
  const media = useManagedMedia(src);
  const effectiveSrc = media?.src ?? src;
  const effectiveAlt = media?.alt?.[locale] ?? alt;

  if (effectiveSrc.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveSrc}
        alt={effectiveAlt}
        className={className}
        sizes={sizes}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
      />
    );
  }

  const shared = {
    src: effectiveSrc,
    alt: effectiveAlt,
    className,
    sizes: sizes ?? "(max-width: 640px) 50vw, 280px",
    priority: Boolean(priority),
    placeholder: "blur" as const,
    blurDataURL: SHIMMER,
  };

  if (width && height) {
    return <Image {...shared} width={width} height={height} />;
  }
  // Fill mode: parent must be position:relative with an aspect ratio
  // (all product/collection/instagram/best-seller media wrappers are).
  return <Image {...shared} fill />;
}
