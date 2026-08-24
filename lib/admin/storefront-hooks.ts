"use client";

/**
 * Storefront data hooks — merge the static content (SSR baseline) with the
 * centralized Admin store (localStorage) so Admin edits are reflected on the
 * storefront immediately. Before hydration the hooks return the static data
 * exactly, which keeps server/client markup identical.
 */

import { useMemo } from "react";
import {
  resolveCategories,
  resolveProduct,
  resolveProducts,
  type Category,
  type Product,
} from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { useAdminStore } from "@/lib/admin/store";
import {
  getActiveAnnouncements,
  getAppliedDiscount,
  hasFreeShipping,
  type ActiveAnnouncement,
  type AppliedDiscount,
} from "@/lib/admin/promotions";
import type { Promotion, SocialLink } from "@/lib/admin/types";

/** Catalog products for a locale: static base + Admin edits, removals and additions. */
export function useMergedProducts(staticProducts: Product[], locale: Locale): Product[] {
  const { products, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated || products.length === 0) return staticProducts;
    const byId = new Map(products.filter((p) => p.status !== "archived").map((p) => [p.id, p]));
    const merged = staticProducts
      .filter((p) => !byId.has(p.id) || byId.get(p.id)!.status !== "archived")
      .map((p) => {
        const seed = byId.get(p.id);
        return seed ? resolveProduct(seed, locale) : p;
      });
    for (const seed of products) {
      if (seed.status === "archived" || seed.status === "draft") continue;
      if (!staticProducts.some((p) => p.id === seed.id)) merged.push(resolveProduct(seed, locale));
    }
    return merged;
  }, [staticProducts, products, hydrated, locale]);
}

/** Single product with Admin overrides applied; null when deleted in Admin. */
export function useMergedProduct(product: Product | null, locale: Locale): Product | null {
  const { products, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated || !product) return product;
    const seed = products.find((p) => p.id === product.id);
    if (!seed) return null; // deleted from the catalog
    return resolveProduct(seed, locale);
  }, [product, products, hydrated, locale]);
}

/** Admin-only product by slug (for PDPs of newly created products). */
export function useAdminProductBySlug(slug: string, locale: Locale): Product | null {
  const { products, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated) return null;
    const seed = products.find((p) => p.slug === slug && p.status !== "archived");
    return seed ? resolveProduct(seed, locale) : null;
  }, [slug, products, hydrated, locale]);
}

/** Categories for a locale with Admin edits applied (disabled ones removed). */
export function useMergedCategories(staticCategories: Category[], locale: Locale): Category[] {
  const { categories, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated || categories.length === 0) return staticCategories;
    const byId = new Map(categories.filter((c) => c.enabled !== false).map((c) => [c.id, c]));
    const merged = staticCategories.filter((c) => byId.has(c.id)).map((c) => {
      const seed = byId.get(c.id);
      return seed ? resolveCategories([seed], locale)[0] : c;
    });
    for (const seed of categories) {
      if (seed.enabled === false) continue;
      if (!staticCategories.some((c) => c.id === seed.id)) {
        const resolved = resolveCategories([seed], locale)[0];
        if (resolved) merged.push(resolved);
      }
    }
    return merged.sort((a, b) => a.order - b.order);
  }, [staticCategories, categories, hydrated, locale]);
}

/**
 * Single category with Admin edits applied; null after hydration when the
 * category was deleted or disabled in the Admin panel. Before hydration it
 * returns the static category so SSR markup stays intact.
 */
export function useMergedCategory(category: Category, locale: Locale): Category | null {
  const { categories, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated) return category;
    const seed = categories.find((c) => c.id === category.id);
    if (!seed || seed.enabled === false) return null;
    return resolveCategories([seed], locale)[0] ?? category;
  }, [category, categories, hydrated, locale]);
}

export function usePromotions(): Promotion[] {
  const { promotions, hydrated } = useAdminStore();
  // Promotions are admin-only data; return [] until hydrated (SSR-safe).
  return hydrated ? promotions : [];
}

export function useDiscountFor(product: Product | null): AppliedDiscount | null {
  const promotions = usePromotions();
  return useMemo(() => (product ? getAppliedDiscount(promotions, product) : null), [promotions, product]);
}

export function useFreeShippingActive(): boolean {
  const promotions = usePromotions();
  return useMemo(() => hasFreeShipping(promotions), [promotions]);
}

export function useAnnouncements(): ActiveAnnouncement[] {
  const promotions = usePromotions();
  return useMemo(() => getActiveAnnouncements(promotions), [promotions]);
}

/** Active social links ordered by display order. */
export function useActiveSocialLinks(): SocialLink[] {
  const { socialLinks, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated) return [];
    return socialLinks
      .filter((s) => s.active && s.value.trim())
      .sort((a, b) => a.order - b.order);
  }, [socialLinks, hydrated]);
}

export const SOCIAL_LINK_LABELS: Record<SocialLink["network"], string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  email: "Email",
};

/**
 * Media override for a public image. Keyed by the original content src; after
 * hydration returns the current (possibly replaced) src + bilingual alt, or
 * null when the asset is unmanaged or unchanged.
 */
export function useManagedMedia(key: string): { src: string; alt: { en: string; es: string } } | null {
  const { mediaAssets, hydrated } = useAdminStore();
  return useMemo(() => {
    if (!hydrated || mediaAssets.length === 0) return null;
    const asset = mediaAssets.find((m) => m.key === key);
    return asset ? { src: asset.src, alt: asset.alt } : null;
  }, [key, mediaAssets, hydrated]);
}
