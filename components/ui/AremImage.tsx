import Image from "next/image";

interface AremImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Image wrapper. Phase 1 ships local SVG artwork (served verbatim for
 * crispness at any size); the moment real raster photography is added, the
 * same component transparently switches to the Next.js optimized pipeline.
 */
export function AremImage({ src, alt, className, sizes, priority }: AremImageProps) {
  if (src.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      priority={priority}
      fill
    />
  );
}
