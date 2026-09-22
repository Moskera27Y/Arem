import type { CtaLink, Homepage, HomeSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { L, pick, pickImage, type Localized, type LocalizedImage } from "@/lib/content/localized";

interface CtaSeed {
  label: Localized;
  href: string;
}

type HomeSectionSeed =
  | {
      id: string;
      kind: "hero";
      eyebrow: Localized;
      title: Localized;
      titleAccent: Localized;
      subtitle: Localized;
      primaryCta: CtaSeed;
      secondaryCta: CtaSeed;
      image: LocalizedImage;
      slides: {
        eyebrow: Localized;
        title: Localized;
        titleAccent: Localized;
        subtitle: Localized;
        primaryCta: CtaSeed;
        secondaryCta?: CtaSeed;
        image: LocalizedImage;
      }[];
    }
  | {
      id: string;
      kind: "featured-categories";
      eyebrow: Localized;
      title: Localized;
      subtitle: Localized;
      categoryIds: string[];
    }
  | {
      id: string;
      kind: "sale-rail";
      eyebrow: Localized;
      title: Localized;
      subtitle: Localized;
    }
  | {
      id: string;
      kind: "category-rails";
      eyebrow: Localized;
      title: Localized;
      subtitle: Localized;
    }
  | {
      id: string;
      kind: "best-sellers";
      eyebrow: Localized;
      title: Localized;
      subtitle: Localized;
    }
  | {
      id: string;
      kind: "featured-products";
      eyebrow: Localized;
      title: Localized;
      subtitle: Localized;
      productIds: string[];
    }
  | {
      id: string;
      kind: "why-shop";
      title: Localized;
      sub: Localized;
      items: { icon: string; title: Localized; text: Localized }[];
    }
  | {
      id: string;
      kind: "instagram";
      eyebrow: Localized;
      title: Localized;
      handle: string;
      tileImages: string[];
    }
  | {
      id: string;
      kind: "newsletter";
      eyebrow: Localized;
      title: Localized;
      subtitle: Localized;
    }
  | {
      id: string;
      kind: "craftsmanship";
      eyebrow: Localized;
      title: Localized;
      body: Localized[];
      image: LocalizedImage;
      statLabel: Localized;
      statValue: string;
      cta: CtaSeed;
    };

/**
 * Homepage content — an ordered list of sections, bilingual. The home page
 * renders this list generically, so an Admin can add, remove or reorder
 * sections (and translate them) without touching component code.
 */
const seed: HomepageSeed = {
  announcementItems: [
    L("Envíos a todo el mundo", "Worldwide shipping"),
    L("Hecho a mano en Colombia", "Handmade in Colombia"),
    L("Apoyamos a los artesanos locales", "Supporting local artisans"),
  ],
  sections: [
    {
      id: "hero",
      kind: "hero",
      eyebrow: L("Colombian craft from workshop to world", "Artesanía colombiana de taller para el mundo"),
      title: L("Colombia to wear.", "Colombia que se lleva."),
      titleAccent: L("To feel, to share.", "A sentir, a compartir."),
      subtitle: L(
        "Handmade objects from the workshops of seven artisans across five regions — each piece carrying the weight of a place and a craft.",
        "Objetos hechos a mano desde los talleres de siete artesanos en cinco regiones — cada pieza con el peso de un lugar y un oficio.",
      ),
      primaryCta: { label: L("Discover the crafts", "Descubre los oficios"), href: "/shop" },
      secondaryCta: { label: L("Our story", "Nuestra historia"), href: "/about" },
      image: { src: "/images/hero-dedicado-1.webp", alt: L("AREM hero: handmade Colombian objects against warm workshop canvas", "AREM héroe: objetos artesanales colombianos sobre lienzo de taller cálido") },
      slides: [
        {
          eyebrow: L("Up to 40% off", "Hasta 40% off"),
          title: L("Sale,", "Ofertas,"),
          titleAccent: L("while they last.", "hasta agotar."),
          subtitle: L(
            "Ten handwoven pieces, fresh from the workshop.",
            "Diez piezas tejidas, frescas del taller.",
          ),
          primaryCta: { label: L("View the sale", "Ver ofertas"), href: "/shop?sale=1" },
          image: { src: "/images/hero-dedicado-2.webp", alt: L("AREM hero: sale collection against warm workshop canvas", "AREM héroe: colección en oferta sobre lienzo de taller cálido") },
        },
        {
          eyebrow: L("From our Instagram", "De nuestro Instagram"),
          title: L("Handmade,", "Hecho a mano,"),
          titleAccent: L("in Colombia.", "en Colombia."),
          subtitle: L(
            "Workshop moments and new pieces, as they happen.",
            "Momentos de taller y piezas nuevas, en vivo.",
          ),
          primaryCta: { label: L("See the collections", "Ver colecciones"), href: "/collections" },
          image: { src: "/images/hero-dedicado-3.webp", alt: L("AREM hero: workshop moments against warm artisan canvas", "AREM héroe: momentos de taller sobre lienzo de artesano cálido") },
        },
      ],
    },
    {
      id: "categories",
      kind: "featured-categories",
      eyebrow: L("Shop by category", "Comprar por categoría"),
      title: L("Crafts of Colombia", "Oficios de Colombia"),
      subtitle: L(
        "Six crafts, one country. Each with its own land, technique and people.",
        "Seis oficios, un solo país. Cada uno con su tierra, técnica y gente.",
      ),
      categoryIds: ["cat-coffee", "cat-textiles", "cat-ceramics", "cat-bags", "cat-jewelry", "cat-home"],
    },
    {
      id: "best-sellers",
      kind: "best-sellers",
      eyebrow: L("Most loved", "Las favoritas"),
      title: L("Best sellers", "Más vendidas"),
      subtitle: L(
        "The pieces our customers keep reaching for — one by one.",
        "Las piezas que nuestros clientes vuelven a pedir — una por una.",
      ),
    },
    {
      id: "featured-products",
      kind: "featured-products",
      eyebrow: L("New this week", "Novedades"),
      title: L("New releases", "Novedades"),
      subtitle: L(
        "Fresh pieces from our artisans — just arrived.",
        "Piezas nuevas de nuestros artesanos — recién llegadas.",
      ),
      productIds: [
        "pr-mochila-katsu",
        "pr-cafe-altura",
        "pr-vasija-raiz",
        "pr-bolso-monte",
        "pr-ruana-paramo",
        "pr-collar-andino",
      ],
    },
    {
      id: "sale",
      kind: "sale-rail",
      eyebrow: L("Selected pieces", "Piezas seleccionadas"),
      title: L("Sale items", "Ofertas"),
      subtitle: L(
        "Hand-picked pieces, at our best prices.",
        "Piezas elegidas a mano, a nuestros mejores precios.",
      ),
    },
    {
      id: "category-rails",
      kind: "category-rails",
      eyebrow: L("Shop by craft", "Compra por oficio"),
      title: L("Our crafts", "Nuestros oficios"),
      subtitle: L(
        "Three crafts we return to again and again.",
        "Tres oficios a los que volvemos una y otra vez.",
      ),
    },
    {
      id: "why-shop",
      kind: "why-shop",
      title: L("Why choose AREM WORLD", "¿Por qué elegir AREM WORLD?"),
      sub: L(
        "More than a purchase — a direct link to the hands that made it.",
        "Más que una compra — un enlace directo con las manos que la hicieron.",
      ),
      items: [
        {
          icon: "heart",
          title: L("Direct support for artisans", "Apoyas a los artesanos"),
          text: L(
            "Each sale goes straight to the maker who shaped the piece.",
            "Cada venta va directamente al artesano que creó la pieza.",
          ),
        },
        {
          icon: "star",
          title: L("Colombian origin, told plainly", "Origen colombiano, contado claro"),
          text: L(
            "Traditional techniques, natural materials — and the stories behind them.",
            "Técnicas tradicionales, materiales naturales — y las historias detrás.",
          ),
        },
        {
          icon: "shield",
          title: L("A purchase you can stand behind", "Una compra en la que puedes confiar"),
          text: L(
            "Careful packing, tracked shipping, and returns that do not ask questions.",
            "Empaque cuidadoso, envío rastreado y devoluciones sin preguntas.",
          ),
        },
        {
          icon: "globe",
          title: L("Shipping worldwide", "Envíos a todo el mundo"),
          text: L(
            "We deliver Colombian craft to your door, wherever that is.",
            "Llevamos el oficio colombiano hasta tu puerta, donde estés.",
          ),
        },
        {
          icon: "gift",
          title: L("Wrapped with care", "Envuelto con cuidado"),
          text: L(
            "Each piece arrives packaged to last, with its story tucked inside.",
            "Cada pieza llega empaquetada para durar, con su historia dentro.",
          ),
        },
      ],
    },
    {
      id: "instagram",
      kind: "instagram",
      eyebrow: L("Follow us", "Síguenos"),
      title: L("AREM on Instagram", "AREM en Instagram"),
      handle: "@arem.world",
      tileImages: [
        "/images/ig-1.svg",
        "/images/ig-2.svg",
        "/images/ig-3.svg",
        "/images/ig-4.svg",
        "/images/ig-5.svg",
        "/images/ig-6.svg",
      ],
    },
    {
      id: "newsletter",
      kind: "newsletter",
      eyebrow: L("Stay close", "Mantente cerca"),
      title: L("Take Colombia with you", "Llévate Colombia contigo"),
      subtitle: L(
        "Subscribe to receive stories, news and exclusive offers from our artisans.",
        "Suscríbete y recibe historias, novedades y ofertas exclusivas de nuestros artesanos.",
      ),
    },
    // Optional editorial sections kept for Admin flexibility (not in the
    // default redesign order).
    {
      id: "craftsmanship",
      kind: "craftsmanship",
      eyebrow: L("The craft", "El oficio"),
      title: L("Behind every piece there are hands", "Detrás de cada pieza hay unas manos"),
      body: [
        L(
          "AREM was born from one conviction: the handmade object keeps something the machine cannot copy.",
          "AREM nace de una convicción: el objeto hecho a mano guarda algo que la máquina no sabe copiar.",
        ),
      ],
      image: { src: "/images/hero-craft.svg", alt: L("Artisan hands working natural materials", "Manos de artesano trabajando materiales naturales") },
      statLabel: L("partner artisans", "artesanos aliados"),
      statValue: "120+",
      cta: { label: L("About AREM WORLD", "Conoce AREM WORLD"), href: "/about" },
    },
  ],
};

interface HomepageSeed {
  announcementItems: Localized[];
  sections: HomeSectionSeed[];
}

const cta = (c: CtaSeed, locale: Locale): CtaLink => ({ label: pick(c.label, locale), href: c.href });

const resolve = (locale: Locale): HomeSection[] =>
  seed.sections.map((s) => {
    switch (s.kind) {
      case "hero":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          titleAccent: pick(s.titleAccent, locale),
          subtitle: pick(s.subtitle, locale),
          primaryCta: cta(s.primaryCta, locale),
          secondaryCta: cta(s.secondaryCta, locale),
          image: pickImage(s.image, locale),
          slides: s.slides.map((slide) => ({
            eyebrow: pick(slide.eyebrow, locale),
            title: pick(slide.title, locale),
            titleAccent: pick(slide.titleAccent, locale),
            subtitle: pick(slide.subtitle, locale),
            primaryCta: cta(slide.primaryCta, locale),
            secondaryCta: slide.secondaryCta ? cta(slide.secondaryCta, locale) : undefined,
            image: pickImage(slide.image, locale),
          })),
        };
      case "featured-categories":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          subtitle: pick(s.subtitle, locale),
          categoryIds: s.categoryIds,
        };
      case "sale-rail":
      case "category-rails":
      case "best-sellers":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          subtitle: pick(s.subtitle, locale),
        };
      case "featured-products":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          subtitle: pick(s.subtitle, locale),
          productIds: s.productIds,
        };
      case "why-shop":
        return {
          id: s.id,
          kind: s.kind,
          title: pick(s.title, locale),
          sub: pick(s.sub, locale),
          items: s.items.map((item) => ({
            icon: item.icon,
            title: pick(item.title, locale),
            text: pick(item.text, locale),
          })),
        };
      case "instagram":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          handle: s.handle,
          tileImages: s.tileImages,
        };
      case "newsletter":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          subtitle: pick(s.subtitle, locale),
        };
      case "craftsmanship":
        return {
          id: s.id,
          kind: s.kind,
          eyebrow: pick(s.eyebrow, locale),
          title: pick(s.title, locale),
          body: s.body.map((b) => pick(b, locale)),
          image: pickImage(s.image, locale),
          statLabel: pick(s.statLabel, locale),
          statValue: s.statValue,
          cta: cta(s.cta, locale),
        };
    }
  });

export const getHomepage = (locale: Locale): Homepage => ({
  announcementItems: seed.announcementItems.map((a) => pick(a, locale)),
  sections: resolve(locale),
});
