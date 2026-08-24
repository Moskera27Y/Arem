/**
 * Content facade — the single seam between the storefront and its data.
 *
 * Every page imports from here instead of from the individual modules. All
 * accessors are locale-aware: pass the active locale (from the URL segment)
 * to receive the entity in that language. When a later phase introduces a
 * database (and an Admin panel), only this file's implementation changes —
 * pages, components and types stay identical.
 */

export { getSiteConfig, siteSeed, resolveSiteConfig } from "@/lib/content/site";
export type { SiteSeed } from "@/lib/content/site";
export { getHomepage } from "@/lib/content/homepage";
export { getAboutContent } from "@/lib/content/about";

export { L, pick, pickImage } from "@/lib/content/localized";
export type { Localized, LocalizedImage } from "@/lib/content/localized";

export {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  categorySeeds,
  getCategorySeedById,
  resolveCategories,
} from "@/lib/content/categories";
export type { CategorySeed } from "@/lib/content/categories";

export {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getProductsByCollection,
  getProductsByRegion,
  getProductsByArtisan,
  getFeaturedProducts,
  getActiveProducts,
  getProductSlugs,
  getVariantById,
  productSeeds,
  getProductSeedById,
  getProductSeedBySlug,
  resolveProducts,
  resolveProduct,
} from "@/lib/content/products";
export type { ProductSeed } from "@/lib/content/products";

export {
  getCollections,
  getCollectionById,
  getCollectionBySlug,
} from "@/lib/content/collections";

export {
  getRegions,
  getRegionById,
  getRegionBySlug,
  regionSeeds,
} from "@/lib/content/regions";

export {
  getArtisans,
  getArtisanById,
  getArtisansByRegion,
} from "@/lib/content/artisans";

export {
  getStories,
  getStoryBySlug,
  getFeaturedStories,
  getStorySlugs,
  storySeeds,
} from "@/lib/content/stories";

export type {
  Artisan,
  CartLine,
  CartState,
  Category,
  Collection,
  Currency,
  CtaLink,
  Homepage,
  HomeSection,
  ImageRef,
  Money,
  Product,
  ProductOption,
  ProductStatus,
  ProductVariant,
  Region,
  SiteConfig,
  SiteNavLink,
  Story,
} from "@/lib/types";
