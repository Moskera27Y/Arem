/**
 * AREM WORLD — Admin domain types.
 *
 * Admin entities are bilingual seeds (the same `{ en, es }` shape the
 * storefront content modules use), so the Admin panel and the storefront
 * share one centralized data model. A future database-backed Admin will
 * persist exactly these records per locale.
 */

import type { CategorySeed, ProductSeed } from "@/lib/content";

export type AdminProduct = ProductSeed;
export type AdminCategory = CategorySeed;

export type PromotionType = "percentage" | "fixed" | "free-shipping" | "announcement";

export interface Promotion {
  id: string;
  /** Internal name (Admin only). */
  name: string;
  /** Internal description (Admin only). */
  description: string;
  type: PromotionType;
  /** Percentage (0–100) for "percentage", USD amount for "fixed", else 0. */
  value: number;
  /** ISO date `yyyy-mm-dd`. */
  startDate: string;
  endDate: string;
  active: boolean;
  /** Applicable products; empty + empty categories = entire catalog. */
  productIds: string[];
  categoryIds: string[];
  /** Public announcement text (bilingual) — shown for announcement type. */
  announcement: { en: string; es: string };
}

export type PromotionStatus = "active" | "scheduled" | "expired" | "inactive";

export type SocialNetwork =
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "facebook"
  | "whatsapp"
  | "email";

export interface SocialLink {
  id: string;
  network: SocialNetwork;
  /** Optional display label; falls back to the network name. */
  label?: string;
  /** URL or contact value. */
  value: string;
  active: boolean;
  order: number;
}

export const SOCIAL_NETWORKS: { id: SocialNetwork; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "pinterest", label: "Pinterest" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
];

export const PROMOTION_TYPES: { id: PromotionType; label: string }[] = [
  { id: "percentage", label: "Percentage discount" },
  { id: "fixed", label: "Fixed discount (USD)" },
  { id: "free-shipping", label: "Free shipping" },
  { id: "announcement", label: "Announcement" },
];

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  inactive: "Inactive",
};

export interface AdminContentState {
  products: AdminProduct[];
  categories: AdminCategory[];
  promotions: Promotion[];
  socialLinks: SocialLink[];
  mediaAssets: MediaAsset[];
}

/** Media usage/type categories shown in the Media library. */
export type MediaType =
  | "hero"
  | "product"
  | "category"
  | "story"
  | "region"
  | "social"
  | "footer";

export const MEDIA_TYPES: { id: MediaType; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "product", label: "Product" },
  { id: "category", label: "Category" },
  { id: "story", label: "Story" },
  { id: "region", label: "Region" },
  { id: "social", label: "Social" },
  { id: "footer", label: "Footer" },
];

/**
 * A managed public-facing media asset. `key` is the stable original content
 * src (the identity the storefront references); `src` is the current URL
 * (possibly replaced via the Media library). Alt text is bilingual.
 */
export interface MediaAsset {
  id: string;
  key: string;
  src: string;
  alt: { en: string; es: string };
  type: MediaType;
  /** Human-readable "where this is used" (e.g. "Product · Mochila"). */
  usage: string;
  updatedAt?: string;
}

/** Version gate for localStorage payloads — bump to reset stale caches. */
export const ADMIN_STORAGE_VERSION = 4;
export const ADMIN_STORAGE_KEY = "arem.admin.v1";
