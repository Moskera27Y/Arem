"use client";

import { useEffect } from "react";

/**
 * Native View Transitions API between Next.js navigations.
 *
 * Next.js 15 App Router automatically starts a view transition for every
 * client-side navigation when the CSS `view-transition` property is enabled
 * on the root (it reads support at runtime). We only need to:
 *  1. Confirm the API is supported (skip on old browsers).
 *  2. Respect `prefers-reduced-motion` (disable transitions for that group).
 *  3. Add a CSS class so consumers can style ::view-transition-* pseudo
 *     elements (e.g. crossfade) from globals.css.
 *
 * No external deps, no navigation interception hacks.
 */
export function ViewTransitions() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("startViewTransition" in window)) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return; // transitions auto-disabled by the UA for this group

    document.documentElement.classList.add("vt-enabled");

    // Reduce motion toggle: stop transitions if the user flips the setting
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.remove("vt-enabled");
      } else {
        document.documentElement.classList.add("vt-enabled");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return null;
}
