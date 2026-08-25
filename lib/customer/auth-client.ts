"use client";

const WISHLIST_KEY = "arem.wishlist.v1";

/** Guest wishlist ids stored in localStorage (used to merge on sign-in). */
export function readGuestWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearGuestWishlist(): void {
  try {
    window.localStorage.removeItem(WISHLIST_KEY);
  } catch {
    /* ignore */
  }
}

/** Tell the wishlist provider that auth state changed so it re-syncs. */
export function notifyAuthChange(): void {
  window.dispatchEvent(new Event("arem:auth-change"));
}
