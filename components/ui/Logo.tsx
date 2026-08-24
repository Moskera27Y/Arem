import Link from "next/link";

interface LogoProps {
  /** "dark" = ink wordmark (light backgrounds), "light" = paper wordmark (dark backgrounds). */
  variant?: "dark" | "light";
  /** Locale-prefixed home path, e.g. "/en". Falls back to "/" (middleware redirects). */
  href?: string;
}

/**
 * AREM WORLD typographic wordmark — the primary brand identity.
 * (Phase 1 ships the wordmark; the final AREM mark drops in at launch.)
 */
export function Logo({ variant = "dark", href = "/" }: LogoProps) {
  return (
    <Link href={href} className="logo" aria-label="AREM WORLD — home">
      <span className="logo__word">AREM</span>
      <span className="logo__sub">World · Colombia</span>
    </Link>
  );
}
