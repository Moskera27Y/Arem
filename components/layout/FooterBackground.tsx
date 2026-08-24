"use client";

import { useManagedMedia } from "@/lib/admin/storefront-hooks";

/** Dark background texture for the footer — media-managed (Admin → Media). */
export function FooterBackground() {
  const media = useManagedMedia("/images/brand-1.svg");
  const src = media?.src ?? "/images/brand-1.svg";
  return (
    <div
      className="footer__bg"
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}
