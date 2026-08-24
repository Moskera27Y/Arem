import type { Region } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

interface RegionSeed {
  id: string;
  slug: string;
  name: Localized;
  department: Localized;
  description: Localized;
  highlights: Localized[];
  image: LocalizedImage;
  order: number;
}

/**
 * Origin regions — bilingual. The storefront renders whatever regions exist;
 * an Admin manages them per locale in a later phase.
 */
const seed: RegionSeed[] = [
  {
    id: "reg-eje-cafetero",
    slug: "eje-cafetero",
    name: L("Eje Cafetero", "Eje Cafetero"),
    department: L("Quindío · Caldas · Risaralda", "Quindío · Caldas · Risaralda"),
    description: L(
      "Green mountains where coffee has been grown for generations. Home to family farms, guadua architecture and the slow ritual of the tinto.",
      "Montañas verdes donde se cultiva café desde hace generaciones. Hogar de fincas familiares, arquitectura de guadua y el lento ritual del tinto.",
    ),
    highlights: [
      L("Single-origin coffee", "Café de origen único"),
      L("Guadua architecture", "Arquitectura de guadua"),
      L("Family farms", "Fincas familiares"),
      L("Bird-rich forests", "Bosques llenos de aves"),
    ],
    image: { src: "/images/r-andes.svg", alt: L("Andean highlands of the coffee axis", "Alturas andinas del eje cafetero") },
    order: 1,
  },
  {
    id: "reg-guajira",
    slug: "la-guajira",
    name: L("La Guajira", "La Guajira"),
    department: L("Guajira peninsula", "Península de La Guajira"),
    description: L(
      "A desert of light where the Wayuu people weave mochilas and carry a matriarchal culture older than the nation itself.",
      "Un desierto de luz donde el pueblo wayuu teje mochilas y conserva una cultura matriarcal anterior a la nación misma.",
    ),
    highlights: [
      L("Wayuu mochilas", "Mochilas wayuu"),
      L("Desert sun", "Sol del desierto"),
      L("Matriarchal weaving", "Tejido matriarcal"),
      L("Cabo de la Vela", "Cabo de la Vela"),
    ],
    image: { src: "/images/r-guajira.svg", alt: L("Desert sun over La Guajira", "Sol del desierto sobre La Guajira") },
    order: 2,
  },
  {
    id: "reg-boyaca",
    slug: "boyaca-andes",
    name: L("Boyacá & Los Andes", "Boyacá y Los Andes"),
    department: L("Boyacá · Cundinamarca highlands", "Boyacá · Alturas de Cundinamarca"),
    description: L(
      "Cold highland air, clay earth and the pottery town of Ráquira, where the mud of the páramo becomes objects of daily beauty.",
      "Aire frío de altura, tierra de barro y el pueblo alfarero de Ráquira, donde el lodo del páramo se vuelve objetos de belleza cotidiana.",
    ),
    highlights: [
      L("Ráquira pottery", "Alfarería de Ráquira"),
      L("Páramo wool", "Lana de páramo"),
      L("Highland textiles", "Textiles de altura"),
      L("Salt and stone", "Sal y piedra"),
    ],
    image: { src: "/images/r-andes.svg", alt: L("Highlands of Boyacá", "Alturas de Boyacá") },
    order: 3,
  },
  {
    id: "reg-bogota",
    slug: "bogota",
    name: L("Bogotá", "Bogotá"),
    department: L("Bogotá D.C.", "Bogotá D.C."),
    description: L(
      "A city of ateliers: leather workshops, jewellers' benches and designers who pair craft heritage with contemporary form.",
      "Una ciudad de talleres: marroquinerías, bancos de joyería y diseñadores que combinan la herencia artesanal con la forma contemporánea.",
    ),
    highlights: [
      L("Leather ateliers", "Talleres de cuero"),
      L("Emerald district", "Distrito de la esmeralda"),
      L("Contemporary design", "Diseño contemporáneo"),
      L("Craft galleries", "Galerías de oficio"),
    ],
    image: { src: "/images/r-bogota.svg", alt: L("Craft ateliers of Bogotá", "Talleres de oficio de Bogotá") },
    order: 4,
  },
  {
    id: "reg-caribe",
    slug: "caribe",
    name: L("Caribe", "Caribe"),
    department: L("Cartagena · Bolívar · Sucre", "Cartagena · Bolívar · Sucre"),
    description: L(
      "Sea breeze, hammocks and the basket-weaving villages of the coast — where craft is made for rest and for the market alike.",
      "Brisa de mar, hamacas y los pueblos cesteros de la costa — donde el oficio se hace tanto para el descanso como para el mercado.",
    ),
    highlights: [
      L("Hammock weaving", "Tejido de hamacas"),
      L("Sea-grass baskets", "Canastos de hierba marina"),
      L("Coastal palettes", "Paletas costeras"),
      L("Street markets", "Mercados callejeros"),
    ],
    image: { src: "/images/r-caribe.svg", alt: L("Caribbean coast waves", "Olas de la costa caribe") },
    order: 5,
  },
];

export const regionSeeds = seed;

const resolve = (locale: Locale): Region[] =>
  seed.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: pick(r.name, locale),
    department: pick(r.department, locale),
    description: pick(r.description, locale),
    highlights: r.highlights.map((h) => pick(h, locale)),
    image: pickImage(r.image, locale),
    order: r.order,
  }));

export const getRegions = (locale: Locale) => resolve(locale);
export const getRegionById = (locale: Locale, id?: string) =>
  id ? resolve(locale).find((r) => r.id === id) : undefined;
export const getRegionBySlug = (locale: Locale, slug: string) => resolve(locale).find((r) => r.slug === slug);
