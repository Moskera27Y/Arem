"use client";

/**
 * ManagedImage — renders a public storefront image that is controllable from
 * the Admin Media library. Before hydration it renders the passed src/alt
 * (SSR baseline, no mismatch); after hydration it substitutes the managed
 * replacement (src + bilingual alt) so Admin media edits reflect immediately.
 */

import { useLocale } from "@/lib/i18n/locale-context";
import { useManagedMedia } from "@/lib/admin/storefront-hooks";

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
