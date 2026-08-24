import type { Collection } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

interface CollectionSeed {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  story: Localized;
  image: LocalizedImage;
  productIds: string[];
  featured?: boolean;
  order: number;
}

/**
 * Collections (curated product groupings) — bilingual. Admin-managed in a
 * later phase.
 */
const seed: CollectionSeed[] = [
  {
    id: "col-raiz",
    slug: "raiz",
    name: L("Raíz", "Raíz"),
    tagline: L("The heritage edit", "La edición de herencia"),
    description: L(
      "Pieces that carry the deepest traditions — Wayuu weaving, Ráquira clay, highland wool. Objects of origin, made to outlive trends.",
      "Piezas que cargan las tradiciones más profundas — tejido wayuu, barro de Ráquira, lana de altura. Objetos de origen, hechos para sobrevivir a las modas.",
    ),
    story: L(
      "Raíz gathers the objects that anchor Colombian craft: the mochila of the desert, the vase of the highlands, the ruana of the páramo. Each one is made by hands that learned from hands.",
      "Raíz reúne los objetos que anclan el oficio colombiano: la mochila del desierto, la vasija de la altura, la ruana del páramo. Cada una está hecha por manos que aprendieron de manos.",
    ),
    image: { src: "/images/cat-textiles.svg", alt: L("Heritage edit — woven textiles", "Edición de herencia — textiles tejidos") },
    productIds: ["pr-mochila-katsu", "pr-vasija-raiz", "pr-ruana-paramo", "pr-collar-andino"],
    featured: true,
    order: 1,
  },
  {
    id: "col-hecha-mano",
    slug: "hecha-a-mano",
    name: L("Hecho a Mano", "Hecho a Mano"),
    tagline: L("Everyday handmade", "Hecho a mano para el día a día"),
    description: L(
      "The daily objects of Colombian life, made by hand and priced fairly — bags, belts and table pieces for the way you actually live.",
      "Los objetos diarios de la vida colombiana, hechos a mano y con precio justo — bolsos, cinturones y piezas de mesa para la forma en que de verdad vives.",
    ),
    story: L(
      "Handmade should not mean precious-only. This edit is for the pieces you reach for every day, made with the same care as the heirlooms.",
      "Hecho a mano no debería significar solo piezas de vitrina. Esta edición es para las piezas que usas todos los días, hechas con el mismo cuidado que las herencias.",
    ),
    image: { src: "/images/cat-bags.svg", alt: L("Everyday handmade edit", "Edición hecha a mano para el día a día") },
    productIds: ["pr-mochila-katsu", "pr-ruana-paramo", "pr-bolso-monte", "pr-cinturon-sendero"],
    featured: true,
    order: 2,
  },
  {
    id: "col-cafe",
    slug: "cafe-de-colombia",
    name: L("Café de Colombia", "Café de Colombia"),
    tagline: L("The origin, roasted", "El origen, tostado"),
    description: L(
      "Direct-trade coffees from the families who grow them — the Eje Cafetero, the Sierra Nevada, the highlands. Fresh roast, honest origin.",
      "Cafés de comercio directo de las familias que los cultivan — el Eje Cafetero, la Sierra Nevada, la altura. Tueste fresco, origen honesto.",
    ),
    story: L(
      "Coffee is Colombia's craft economy at its most personal. We work with growers who control their own process, from cherry to roast.",
      "El café es la economía artesanal de Colombia en su forma más personal. Trabajamos con cultivadores que controlan su propio proceso, de la cereza al tueste.",
    ),
    image: { src: "/images/cat-coffee.svg", alt: L("Café de Colombia collection", "Colección Café de Colombia") },
    productIds: ["pr-cafe-altura", "pr-cafe-sierra"],
    featured: true,
    order: 3,
  },
  {
    id: "col-caribe",
    slug: "caribe",
    name: L("Caribe", "Caribe"),
    tagline: L("Coastal living", "Vida costera"),
    description: L(
      "The colour and rhythm of the Caribbean coast: hammocks for the afternoon, baskets from the market, sea and salt in every palette.",
      "El color y el ritmo de la costa caribe: hamacas para la tarde, canastos del mercado, mar y sal en cada paleta.",
    ),
    story: L(
      "The coast makes craft for rest and celebration. This edit brings a little of its breeze to your home.",
      "La costa hace oficio para el descanso y la celebración. Esta edición lleva un poco de su brisa a tu hogar.",
    ),
    image: { src: "/images/r-caribe.svg", alt: L("Caribe collection — coastal living", "Colección Caribe — vida costera") },
    productIds: ["pr-hamaca-brisa", "pr-canasto-norte", "pr-cafe-sierra"],
    featured: false,
    order: 4,
  },
];

const resolve = (locale: Locale): Collection[] =>
  seed.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: pick(c.name, locale),
    tagline: pick(c.tagline, locale),
    description: pick(c.description, locale),
    story: pick(c.story, locale),
    image: pickImage(c.image, locale),
    productIds: c.productIds,
    featured: c.featured,
    order: c.order,
  }));

export const getCollections = (locale: Locale) => resolve(locale);
export const getCollectionById = (locale: Locale, id: string) => resolve(locale).find((c) => c.id === id);
export const getCollectionBySlug = (locale: Locale, slug: string) => resolve(locale).find((c) => c.slug === slug);
