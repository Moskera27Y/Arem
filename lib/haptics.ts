/**
 * Subtle haptic tick for touch confirmations (add-to-cart, wishlist…).
 * No-op on devices without a vibrator; never throws.
 */
export function tick(duration = 8): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    /* ignore */
  }
}
