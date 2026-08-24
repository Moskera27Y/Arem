import Link from "next/link";

interface LogoProps {
  /**
   * "dark" = natural brand colors (light backgrounds, e.g. the cream/ivory
   * header). "light" = white monochrome silhouette for dark surfaces (footer).
   * The SVG asset itself is never recolored or edited — only its on-surface
   * rendering is adapted via CSS filter for contrast.
   */
  variant?: "dark" | "light";
  /** Locale-prefixed home path, e.g. "/en" (used as the localized home link). */
  href?: string;
}

/**
 * AREM WORLD brand logo — the supplied `arem-world-logo.svg` wordmark.
 * Rendered with preserved aspect ratio; sized by context via `.logo__img`.
 */
export function Logo({ variant = "dark", href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`logo${variant === "light" ? " logo--light" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/arem-world-logo.svg"
        alt="AREM WORLD — Colombian craftsmanship"
        className="logo__img"
      />
    </Link>
  );
}
