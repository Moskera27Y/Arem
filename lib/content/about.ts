import type { Locale } from "@/lib/i18n/config";
import { L, pick, type Localized } from "@/lib/content/localized";

export interface AboutContent {
  hero: { eyebrow: Localized; title: Localized; sub: Localized };
  origin: {
    eyebrow: Localized;
    title: Localized;
    body: Localized[];
    quote: Localized;
    quoteAuthor: Localized;
  };
  values: { title: Localized; values: { num: string; title: Localized; text: Localized }[] };
  cta: { title: Localized; sub: Localized; stories: Localized; shop: Localized };
}

const content: AboutContent = {
  hero: {
    eyebrow: L("Who we are", "Quiénes somos"),
    title: L("AREM WORLD", "AREM WORLD"),
    sub: L(
      "A bridge between the workshops of Colombia and the homes of the world. We were born of a love for handwork and of pride for a country that does not know how good it is.",
      "Un puente entre los talleres de Colombia y las casas del mundo. Nacimos del amor por lo hecho a mano y del orgullo por un país que no sabe lo bueno que es.",
    ),
  },
  origin: {
    eyebrow: L("Our origin", "Nuestro origen"),
    title: L("It started with a suitcase", "Empezó con una maleta"),
    body: [
      L(
        "AREM WORLD was born in 2024, between a coffee farm in Quindío and a pottery workshop in Ráquira. The idea was simple: Colombian craft deserves an international stage, and artisans deserve to be treated as what they are — authors, not suppliers.",
        "AREM WORLD nació en 2024, entre una finca cafetera del Quindío y un taller de cerámica en Ráquira. La idea era simple: el oficio colombiano merece vitrina internacional, y los artesanos merecen ser tratados como lo que son — autores, no proveedores.",
      ),
      L(
        "Today we work with more than 120 artisans and producers in 27 municipalities, and every piece we sell comes with transparent origin. That is not a marketing promise: it is our model.",
        "Hoy trabajamos con más de 120 artesanos y productores en 27 municipios, y cada pieza que vendemos cuenta con la transparencia de su origen. No es una promesa de marketing: es nuestro modelo.",
      ),
    ],
    quote: L(
      "We don't sell objects. We sell the well-spent time of people who know how to make things with their hands.",
      "No vendemos objetos. Vendemos el tiempo bien usado de personas que saben hacer cosas con las manos.",
    ),
    quoteAuthor: L("Founding team, AREM WORLD", "Equipo fundador, AREM WORLD"),
  },
  values: {
    title: L("What we believe", "Lo que creemos"),
    values: [
      {
        num: "01",
        title: L("Real origin", "Origen real"),
        text: L(
          "Every piece has a place, a name and a verifiable story. Nothing is bought without knowing where it comes from.",
          "Cada pieza tiene un lugar, un nombre y una historia verificable. Nada se compra sin saber de dónde viene.",
        ),
      },
      {
        num: "02",
        title: L("Fair price", "Precio justo"),
        text: L(
          "The artisan sets the value of their work. We set the price together with them, not above them.",
          "El artesano fija el valor de su trabajo. Nosotros ponemos el precio junto con él, no por encima de él.",
        ),
      },
      {
        num: "03",
        title: L("Made to last", "Hecho para durar"),
        text: L(
          "We work natural materials and traditional techniques that age well. We prefer ten pieces that last over a hundred that break.",
          "Trabajamos materiales naturales y técnicas tradicionales que envejecen bien. Preferimos diez piezas que duren a cien que se rompan.",
        ),
      },
      {
        num: "04",
        title: L("Told with pride", "Contado con orgullo"),
        text: L(
          "Colombian craft deserves to be told seriously: with names, with techniques, with dignity. That is what we do here.",
          "La artesanía colombiana merece ser contada en serio: con nombres, con técnicas, con dignidad. Eso hacemos aquí.",
        ),
      },
    ],
  },
  cta: {
    title: L("Want to meet the hands?", "¿Quieres conocer a las manos?"),
    sub: L(
      "Read the stories of our artisans, or explore the shop to see their work.",
      "Lee las historias de nuestros artesanos o explora la tienda para ver su trabajo.",
    ),
    stories: L("Read stories", "Leer historias"),
    shop: L("Explore the shop", "Explorar la tienda"),
  },
};

export function getAboutContent(locale: Locale): {
  hero: { eyebrow: string; title: string; sub: string };
  origin: { eyebrow: string; title: string; body: string[]; quote: string; quoteAuthor: string };
  values: { title: string; values: { num: string; title: string; text: string }[] };
  cta: { title: string; sub: string; stories: string; shop: string };
} {
  return {
    hero: {
      eyebrow: pick(content.hero.eyebrow, locale),
      title: pick(content.hero.title, locale),
      sub: pick(content.hero.sub, locale),
    },
    origin: {
      eyebrow: pick(content.origin.eyebrow, locale),
      title: pick(content.origin.title, locale),
      body: content.origin.body.map((b) => pick(b, locale)),
      quote: pick(content.origin.quote, locale),
      quoteAuthor: pick(content.origin.quoteAuthor, locale),
    },
    values: {
      title: pick(content.values.title, locale),
      values: content.values.values.map((v) => ({
        num: v.num,
        title: pick(v.title, locale),
        text: pick(v.text, locale),
      })),
    },
    cta: {
      title: pick(content.cta.title, locale),
      sub: pick(content.cta.sub, locale),
      stories: pick(content.cta.stories, locale),
      shop: pick(content.cta.shop, locale),
    },
  };
}
