import type { Artisan } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

interface ArtisanSeed {
  id: string;
  slug: string;
  name: Localized;
  craft: Localized;
  regionId: string;
  bio: Localized;
  quote: Localized;
  image: LocalizedImage;
}

/**
 * Artisans / producers — bilingual. Products reference an artisan by id;
 * an Admin manages these profiles per locale in a later phase.
 */
const seed: ArtisanSeed[] = [
  {
    id: "art-amalia",
    slug: "amalia-rojas",
    name: L("Amalia Rojas Epieyú", "Amalia Rojas Epieyú"),
    craft: L("Wayuu weaver · 34 years", "Tejedora wayuu · 34 años"),
    regionId: "reg-guajira",
    bio: L(
      "Born in Uribia, Amalia learned to weave mochilas from her grandmother at the age of nine. She now leads a weaving circle of twelve women from her ranchería, preserving the patterns and symbols of her matrilineage.",
      "Nacida en Uribia, Amalia aprendió a tejer mochilas de su abuela a los nueve años. Hoy lidera un círculo de tejido de doce mujeres de su ranchería, preservando los patrones y símbolos de su linaje materno.",
    ),
    quote: L(
      "Each mochila carries a thought of mine. While I weave, I think of my daughters.",
      "Cada mochila lleva un pensamiento mío. Mientras tejo, pienso en mis hijas.",
    ),
    image: { src: "/images/a-amalia.svg", alt: L("Portrait of weaver Amalia Rojas", "Retrato de la tejedora Amalia Rojas") },
  },
  {
    id: "art-miguel",
    slug: "miguel-cardenas",
    name: L("Miguel Cárdenas", "Miguel Cárdenas"),
    craft: L("Coffee grower & roaster · 3rd generation", "Caficultor y tostador · 3.ª generación"),
    regionId: "reg-eje-cafetero",
    bio: L(
      "Miguel's grandfather planted the first coffee trees on their finca in Salento. Miguel restored the family farm to organic practice and now roasts small batches at the edge of the property, three hundred metres above the valley.",
      "El abuelo de Miguel sembró los primeros cafetos de su finca en Salento. Miguel recuperó la finca familiar para la práctica orgánica y hoy tuesta pequeños lotes al borde de la propiedad, trescientos metros sobre el valle.",
    ),
    quote: L(
      "Coffee is made three times: in the tree, in the roast, and in the cup.",
      "El café se hace tres veces: en la mata, en la tostión y en la taza.",
    ),
    image: { src: "/images/a-miguel.svg", alt: L("Portrait of coffee grower Miguel Cárdenas", "Retrato del caficultor Miguel Cárdenas") },
  },
  {
    id: "art-lucia",
    slug: "lucia-vasquez",
    name: L("Lucía Vásquez", "Lucía Vásquez"),
    craft: L("Ceramicist · Ráquira", "Ceramista · Ráquira"),
    regionId: "reg-boyaca",
    bio: L(
      "Lucía throws each vase by hand at her workshop in Ráquira, using local clay and a wood-fired kiln her father built in 1987. Every surface is finished with burnishing stones collected from the Chicamocha river.",
      "Lucía moldea cada vasija a mano en su taller de Ráquira, con barro local y un horno de leña que su padre construyó en 1987. Cada superficie se pule con piedras de bruñir recogidas del río Chicamocha.",
    ),
    quote: L(
      "The clay of Ráquira keeps the memory of the land.",
      "El barro de Ráquira guarda la memoria de la tierra.",
    ),
    image: { src: "/images/a-lucia.svg", alt: L("Portrait of ceramicist Lucía Vásquez", "Retrato de la ceramista Lucía Vásquez") },
  },
  {
    id: "art-esteban",
    slug: "esteban-morales",
    name: L("Esteban Morales", "Esteban Morales"),
    craft: L("Leather artisan · Bogotá", "Marroquinero · Bogotá"),
    regionId: "reg-bogota",
    bio: L(
      "A third-generation leatherworker in the La Candelaria district, Esteban cuts every piece by hand from vegetable-tanned leather sourced in the country, and finishes with natural waxes.",
      "Marroquinero de tercera generación en el barrio de La Candelaria, Esteban corta cada pieza a mano en cuero curtido al vegetal de origen nacional y la termina con ceras naturales.",
    ),
    quote: L(
      "Well-worked leather becomes part of the life of whoever carries it.",
      "El cuero bien trabajado se vuelve parte de la vida de quien lo lleva.",
    ),
    image: { src: "/images/a-esteban.svg", alt: L("Portrait of leather artisan Esteban Morales", "Retrato del marroquinero Esteban Morales") },
  },
  {
    id: "art-yamile",
    slug: "yamile-cuesta",
    name: L("Yamile Cuesta", "Yamile Cuesta"),
    craft: L("Jewellery designer · Bogotá", "Diseñadora de joyería · Bogotá"),
    regionId: "reg-bogota",
    bio: L(
      "Trained as a goldsmith, Yamile works with Colombian emeralds selected for colour rather than carat, setting them in recycled silver and gold at her bench in the city's craft quarter.",
      "Formada como orfebre, Yamile trabaja esmeraldas colombianas seleccionadas por su color más que por su peso, engastándolas en plata y oro reciclados en su banco del barrio de oficios de la ciudad.",
    ),
    quote: L(
      "A well-set emerald is a small piece of the cordillera.",
      "Una esmeralda bien puesta es un pedacito de cordillera.",
    ),
    image: { src: "/images/a-yamile.svg", alt: L("Portrait of jeweller Yamile Cuesta", "Retrato de la joyera Yamile Cuesta") },
  },
];

const resolve = (locale: Locale): Artisan[] =>
  seed.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: pick(a.name, locale),
    craft: pick(a.craft, locale),
    regionId: a.regionId,
    bio: pick(a.bio, locale),
    quote: pick(a.quote, locale),
    image: pickImage(a.image, locale),
  }));

export const getArtisans = (locale: Locale) => resolve(locale);
export const getArtisanById = (locale: Locale, id?: string) =>
  id ? resolve(locale).find((a) => a.id === id) : undefined;
export const getArtisansByRegion = (locale: Locale, regionId: string) =>
  resolve(locale).filter((a) => a.regionId === regionId);
