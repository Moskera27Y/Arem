import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

/** Bilingual category seed — the shape an Admin panel edits per locale. */
export interface CategorySeed {
  id: string;
  slug: string;
  name: Localized;
  shortName: Localized;
  description: Localized;
  image: LocalizedImage;
  order: number;
  featured?: boolean;
  enabled?: boolean;
}

export const categorySeeds: CategorySeed[] = [
  {
    id: "cat-coffee",
    slug: "coffee-cacao",
    name: L("Coffee & Cacao", "Café y Cacao"),
    shortName: L("Coffee & Cacao", "Café y Cacao"),
    description: L(
      "Single-origin coffees and cacaos from family farms across the Colombian Andes — roasted with intention, packed with origin.",
      "Cafés y cacaos de origen único de fincas familiares de los Andes colombianos — tostados con intención, envasados con origen.",
    ),
    image: { src: "/images/cat-coffee.svg", alt: L("Hand-roasted Colombian coffee beans", "Café colombiano tostado a mano") },
    order: 1,
    featured: true,
  },
  {
    id: "cat-textiles",
    slug: "textiles",
    name: L("Textiles & Weaving", "Textiles y Tejidos"),
    shortName: L("Textiles", "Textiles"),
    description: L(
      "Ruanas, blankets and woven pieces made on handlooms — each thread a continuation of a family tradition.",
      "Ruanas, cobijas y piezas tejidas en telares manuales — cada hilo es la continuación de una tradición familiar.",
    ),
    image: { src: "/images/cat-textiles.svg", alt: L("Handwoven Colombian textiles", "Textiles colombianos tejidos a mano") },
    order: 2,
    featured: true,
  },
  {
    id: "cat-ceramics",
    slug: "ceramics",
    name: L("Ceramics & Pottery", "Cerámica y Alfarería"),
    shortName: L("Ceramics", "Cerámica"),
    description: L(
      "Clay shaped by hand in Ráquira and beyond: vases, plates and tableware fired the slow, traditional way.",
      "Barro moldeado a mano en Ráquira y más allá: vasijas, platos y vajillas horneadas a la manera lenta y tradicional.",
    ),
    image: { src: "/images/cat-ceramics.svg", alt: L("Handmade ceramic pottery from Ráquira", "Cerámica artesanal de Ráquira") },
    order: 3,
    featured: true,
  },
  {
    id: "cat-bags",
    slug: "bags-leather",
    name: L("Bags & Leather", "Bolsos y Marroquinería"),
    shortName: L("Bags & Leather", "Bolsos y Marroquinería"),
    description: L(
      "Wayuu mochilas woven by hand and leather goods cut and stitched in Bogotá ateliers — made to last decades.",
      "Mochilas wayuu tejidas a mano y piezas de cuero cortadas y cosidas en talleres de Bogotá — hechas para durar décadas.",
    ),
    image: { src: "/images/cat-bags.svg", alt: L("Wayuu mochila bag and leather goods", "Mochila wayuu y piezas de cuero") },
    order: 4,
    featured: true,
  },
  {
    id: "cat-jewelry",
    slug: "jewelry",
    name: L("Jewelry & Emeralds", "Joyería y Esmeraldas"),
    shortName: L("Jewelry", "Joyería"),
    description: L(
      "Colombian emeralds and handmade pieces in silver and gold, set by artisans of the cordillera.",
      "Esmeraldas colombianas y piezas hechas a mano en plata y oro, engastadas por artesanos de la cordillera.",
    ),
    image: { src: "/images/cat-jewelry.svg", alt: L("Colombian emerald jewelry", "Joyería con esmeraldas colombianas") },
    order: 5,
    featured: false,
  },
  {
    id: "cat-home",
    slug: "basketry-home",
    name: L("Basketry & Home", "Cestería y Hogar"),
    shortName: L("Basketry & Home", "Cestería y Hogar"),
    description: L(
      "Baskets, hammocks and objects that bring the warmth of a Colombian home to yours.",
      "Canastos, hamacas y objetos que llevan el calor de un hogar colombiano al tuyo.",
    ),
    image: { src: "/images/cat-home.svg", alt: L("Handwoven Colombian baskets and home objects", "Canastos y objetos de hogar tejidos a mano") },
    order: 6,
    featured: false,
  },
];

/** Resolve bilingual seeds to plain categories for one locale. */
export function resolveCategories(seeds: CategorySeed[], locale: Locale): Category[] {
  return seeds
    .filter((c) => c.enabled !== false)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: pick(c.name, locale),
      shortName: pick(c.shortName, locale),
      description: pick(c.description, locale),
      image: pickImage(c.image, locale),
      order: c.order,
      featured: c.featured,
    }));
}

export const getCategories = (locale: Locale) => resolveCategories(categorySeeds, locale);
export const getCategoryById = (locale: Locale, id: string) =>
  resolveCategories(categorySeeds, locale).find((c) => c.id === id);
export const getCategoryBySlug = (locale: Locale, slug: string) =>
  resolveCategories(categorySeeds, locale).find((c) => c.slug === slug);

/** Seed-level lookup used by the Admin panel. */
export const getCategorySeedById = (id: string) => categorySeeds.find((c) => c.id === id);
