/**
 * Promotion logic — pure helpers shared by the Admin panel and the
 * storefront (both run this client-side; no database involved).
 */

import type { Product } from "@/lib/content";
import type { Promotion, PromotionStatus } from "@/lib/admin/types";

export function getPromotionStatus(promotion: Promotion, now: Date = new Date()): PromotionStatus {
  if (!promotion.active) return "inactive";
  const start = new Date(`${promotion.startDate}T00:00:00`);
  const end = new Date(`${promotion.endDate}T23:59:59`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "inactive";
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

export function isPromotionApplicable(promotion: Promotion, product: Product): boolean {
  if (promotion.type !== "percentage" && promotion.type !== "fixed") return false;
  if (promotion.productIds.length > 0 && promotion.productIds.includes(product.id)) return true;
  if (promotion.categoryIds.length > 0 && product.categoryIds.some((id) => promotion.categoryIds.includes(id))) {
    return true;
  }
  // No product/category targets → applies to the whole catalog.
  return promotion.productIds.length === 0 && promotion.categoryIds.length === 0;
}

export interface AppliedDiscount {
  promotionId: string;
  type: "percentage" | "fixed";
  value: number;
  /** Discounted display price (never below 0). */
  discountedPrice: number;
  /** Percentage badge, e.g. "-15%" (null for fixed). */
  badge: string | null;
}

/**
 * First applicable active discount for a product (list order wins).
 * The storefront keeps this simple and consistent: no stacking.
 */
export function getAppliedDiscount(promotions: Promotion[], product: Product, now: Date = new Date()): AppliedDiscount | null {
  for (const promotion of promotions) {
    if (getPromotionStatus(promotion, now) !== "active") continue;
    if (!isPromotionApplicable(promotion, product)) continue;
    const price = product.price.amount;
    if (promotion.type === "percentage") {
      const discounted = Math.max(0, Math.round(price * (1 - promotion.value / 100)));
      return {
        promotionId: promotion.id,
        type: "percentage",
        value: promotion.value,
        discountedPrice: discounted,
        badge: `-${Math.round(promotion.value)}%`,
      };
    }
    if (promotion.type === "fixed") {
      const discounted = Math.max(0, price - promotion.value);
      return { promotionId: promotion.id, type: "fixed", value: promotion.value, discountedPrice: discounted, badge: null };
    }
  }
  return null;
}

/** True when an active free-shipping promotion exists (any target). */
export function hasFreeShipping(promotions: Promotion[], now: Date = new Date()): boolean {
  return promotions.some(
    (p) => p.type === "free-shipping" && getPromotionStatus(p, now) === "active",
  );
}

export interface ActiveAnnouncement {
  id: string;
  /** Bilingual public text. */
  text: { en: string; es: string };
  /** True when this is a free-shipping note without custom text. */
  fallbackFreeShipping: boolean;
}

/** Active announcements (type "announcement") + free-shipping notes. */
export function getActiveAnnouncements(promotions: Promotion[], now: Date = new Date()): ActiveAnnouncement[] {
  const result: ActiveAnnouncement[] = [];
  for (const p of promotions) {
    if (getPromotionStatus(p, now) !== "active") continue;
    if (p.type === "announcement" && (p.announcement.en.trim() || p.announcement.es.trim())) {
      result.push({ id: p.id, text: p.announcement, fallbackFreeShipping: false });
    } else if (p.type === "free-shipping" && !(p.announcement.en.trim() || p.announcement.es.trim())) {
      result.push({
        id: p.id,
        text: { en: "Free shipping across the store", es: "Envío gratis en toda la tienda" },
        fallbackFreeShipping: true,
      });
    }
  }
  return result;
}
