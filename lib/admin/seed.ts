/**
 * Admin initial state — seeded from the storefront's centralized content
 * modules so the panel opens with the live catalog. localStorage overrides
 * this after the first edit.
 */

import { categorySeeds, productSeeds } from "@/lib/content";
import { buildMediaSeed } from "@/lib/admin/media";
import type { AdminContentState, SocialLink } from "@/lib/admin/types";

const defaultSocialLinks: SocialLink[] = [
  { id: "soc-instagram", network: "instagram", value: "https://instagram.com/arem.world", active: true, order: 1 },
  { id: "soc-tiktok", network: "tiktok", value: "https://tiktok.com/@arem.world", active: true, order: 2 },
  { id: "soc-pinterest", network: "pinterest", value: "https://pinterest.com/aremworld", active: true, order: 3 },
  { id: "soc-facebook", network: "facebook", value: "https://facebook.com/arem.world", active: true, order: 4 },
  { id: "soc-whatsapp", network: "whatsapp", value: "+57 300 123 4567", active: true, order: 5 },
  { id: "soc-email", network: "email", value: "hola@arem.world", active: true, order: 6 },
];

export function getDefaultAdminState(): AdminContentState {
  return {
    products: productSeeds.map((p) => structuredClone(p)),
    categories: categorySeeds.map((c) => structuredClone(c)),
    promotions: [],
    socialLinks: defaultSocialLinks.map((s) => ({ ...s })),
    mediaAssets: buildMediaSeed(),
  };
}
