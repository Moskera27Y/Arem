/**
 * Media library — builds the managed asset list from the centralized content
 * seeds so every public-facing visual is controllable from Admin. URLs and
 * metadata persist in the local prototype data layer (no cloud storage yet);
 * the architecture is ready for Supabase Storage / another image host later.
 */

import type { MediaAsset, MediaType } from "@/lib/admin/types";
import { categorySeeds, productSeeds, regionSeeds, storySeeds } from "@/lib/content";

const INSTAGRAM_TILES = [
  "/images/ig-1.svg",
  "/images/ig-2.svg",
  "/images/ig-3.svg",
  "/images/ig-4.svg",
  "/images/ig-5.svg",
  "/images/ig-6.svg",
];

const slugId = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();

function asset(key: string, src: string, alt: { en: string; es: string }, type: MediaType, usage: string): MediaAsset {
  return { id: `med-${slugId(key)}`, key, src, alt, type, usage };
}

/** Builds the full managed-media list from the live content. */
export function buildMediaSeed(): MediaAsset[] {
  const assets: MediaAsset[] = [];

  // Hero
  assets.push(
    asset(
      "/images/hero-main.svg",
      "/images/hero-main.svg",
      { en: "Andean highlands at dawn, coffee axis of Colombia", es: "Alturas andinas al amanecer, eje cafetero de Colombia" },
      "hero",
      "Hero · Homepage",
    ),
  );

  // Categories
  for (const c of categorySeeds) {
    assets.push(asset(c.image.src, c.image.src, c.image.alt, "category", `Category · ${c.name.en}`));
  }

  // Products (all gallery images)
  for (const p of productSeeds) {
    p.images.forEach((img, index) => {
      const multi = p.images.length > 1 ? ` · image ${index + 1}` : "";
      assets.push(asset(img.src, img.src, img.alt, "product", `Product · ${p.name.en}${multi}`));
    });
  }

  // Stories
  for (const s of storySeeds) {
    assets.push(asset(s.image.src, s.image.src, s.image.alt, "story", `Story · ${s.title.en}`));
  }

  // Regions
  for (const r of regionSeeds) {
    assets.push(asset(r.image.src, r.image.src, r.image.alt, "region", `Region · ${r.name.en}`));
  }

  // Instagram / social tiles
  INSTAGRAM_TILES.forEach((src, index) => {
    assets.push(
      asset(
        src,
        src,
        { en: "Colombian craft, Instagram post", es: "Artesanía colombiana, publicación de Instagram" },
        "social",
        `Instagram · tile ${index + 1}`,
      ),
    );
  });

  // Newsletter / footer background
  assets.push(
    asset(
      "/images/brand-1.svg",
      "/images/brand-1.svg",
      { en: "Colombian landscape, golden hour", es: "Paisaje colombiano, hora dorada" },
      "footer",
      "Newsletter & footer · background",
    ),
  );

  // About page illustration + craftsmanship illustration
  assets.push(
    asset(
      "/images/about-1.svg",
      "/images/about-1.svg",
      { en: "Loom in an artisan workshop", es: "Telar en un taller artesanal" },
      "story",
      "About · illustration",
    ),
  );
  assets.push(
    asset(
      "/images/hero-craft.svg",
      "/images/hero-craft.svg",
      { en: "Artisan hands working natural materials", es: "Manos de artesano trabajando materiales naturales" },
      "story",
      "Craftsmanship · illustration",
    ),
  );

  // Some assets are shared (e.g. one illustration backs two regions). Dedupe
  // by key so a single managed asset controls every usage location, merging
  // the usage labels. The storefront looks up by key, so edits apply to all.
  const seen = new Map<string, MediaAsset>();
  const uniq: MediaAsset[] = [];
  for (const a of assets) {
    const existing = seen.get(a.key);
    if (existing) {
      if (!existing.usage.includes(a.usage)) existing.usage = `${existing.usage} + ${a.usage}`;
    } else {
      seen.set(a.key, a);
      uniq.push(a);
    }
  }
  return uniq;
}

/** Stable ordering for the media grid (hero, product, category, story, region, social, footer). */
const TYPE_ORDER: Record<MediaType, number> = {
  hero: 0,
  product: 1,
  category: 2,
  story: 3,
  region: 4,
  social: 5,
  footer: 6,
};

export function sortMedia(assets: MediaAsset[]): MediaAsset[] {
  return [...assets].sort((a, b) => {
    const t = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
    if (t !== 0) return t;
    return a.usage.localeCompare(b.usage);
  });
}
