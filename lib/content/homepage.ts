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
    L("International shipping to the world", "Envíos internacionales a todo el mundo"),
    L("Handmade in Colombia, with love", "Hecho en Colombia, con amor"),
    L("Supporting Colombian artisans", "Apoyamos a nuestros artesanos"),
  ],
  sections: [
    {
      id: "hero",
      kind: "hero",
      eyebrow: L("Colombian craft, curated for the world", "Artesanía colombiana para el mundo"),
      title: L("Colombia to wear, to feel,", "Colombia que se lleva, se siente"),
      titleAccent: L("to share.", "y se comparte."),
      subtitle: L(
        "Authentic Colombian products made with tradition, passion and the hands of our artisans.",
        "Productos auténticos de Colombia hechos con tradición, pasión y las manos de nuestros artesanos.",
      ),
      primaryCta: { label: L("Discover Colombia", "Descubre Colombia"), href: "/shop" },
      secondaryCta: { label: L("Read our story", "Nuestra historia"), href: "/about" },
      image: { src: "/images/hero-main.svg", alt: L("Andean highlands at dawn, coffee axis of Colombia", "Alturas andinas al amanecer, eje cafetero de Colombia") },
      slides: [
        {
          eyebrow: L("New collection", "Nueva colección"),
          title: L("The Andes,", "Los Andes,"),
          titleAccent: L("woven to wear.", "tejidos para llevar."),
          subtitle: L(
            "Mochilas, textiles and jewels handmade by Colombian artisans.",
            "Mochilas, textiles y joyas hechos a mano por artesanos colombianos.",
          ),
          primaryCta: { label: L("Shop new in", "Ver novedades"), href: "/shop" },
          image: { src: "/images/hero-craft.svg", alt: L("Artisan hands working natural materials", "Manos de artesano trabajando materiales naturales") },
        },
        {
          eyebrow: L("Up to 40% off", "Hasta 40% off"),
          title: L("Sale,", "Ofertas,"),
          titleAccent: L("while they last.", "hasta agotar."),
          subtitle: L(
            "Special prices on beloved handmade pieces.",
            "Precios especiales en piezas hechas a mano.",
          ),
          primaryCta: { label: L("Shop the sale", "Ver ofertas"), href: "/shop?sale=1" },
          image: { src: "/images/p-mochila-katsu-1.svg", alt: L("Wayuu mochila, handwoven", "Mochila wayuu, tejida a mano") },
        },
      ],
    },
    {
      id: "categories",
      kind: "featured-categories",
      eyebrow: L("Shop by category", "Comprar por categoría"),
      title: L("Explore Colombia", "Explora Colombia"),
      subtitle: L(
        "Six crafts, one country. Each with its land, its technique and its people.",
        "Seis oficios, un solo país. Cada uno con su tierra, su técnica y su gente.",
      ),
      categoryIds: ["cat-coffee", "cat-textiles", "cat-ceramics", "cat-bags", "cat-jewelry", "cat-home"],
    },
    {
      id: "best-sellers",
      kind: "best-sellers",
      eyebrow: L("Most loved", "Las favoritas"),
      title: L("Best sellers", "Más vendidas"),
      subtitle: L(
        "The pieces our customers can't stop reordering — one by one.",
        "Las piezas que no dejan de pedir — una por una.",
      ),
    },
    {
      id: "featured-products",
      kind: "featured-products",
      eyebrow: L("New releases", "Novedades"),
      title: L("New releases", "Novedades"),
      subtitle: L(
        "The latest pieces from our artisans — fresh this week.",
        "Las piezas más recientes de nuestros artesanos — frescas esta semana.",
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
      eyebrow: L("Up to 40% off select styles", "Hasta 40% off en estilos seleccionados"),
      title: L("Sale items", "Ofertas"),
      subtitle: L(
        "Special prices on beloved pieces — while they last.",
        "Precios especiales en piezas queridas — hasta agotar.",
      ),
    },
    {
      id: "category-rails",
      kind: "category-rails",
      eyebrow: L("Shop by craft", "Compra por oficio"),
      title: L("Our crafts", "Nuestros oficios"),
      subtitle: L(
        "Three signature crafts, curated for you.",
        "Tres oficios insignia, seleccionados para ti.",
      ),
    },
    {
      id: "why-shop",
      kind: "why-shop",
      title: L("Why shop at AREM WORLD", "¿Por qué comprar en AREM WORLD?"),
      sub: L(
        "More than a purchase — a direct connection to Colombian hands.",
        "Más que una compra — una conexión directa con las manos de Colombia.",
      ),
      items: [
        {
          icon: "heart",
          title: L("Direct support for artisans", "Apoyas a los artesanos"),
          text: L(
            "Every piece directly supports the artisans and producers who made it.",
            "Cada pieza apoya directamente a los artesanos y productores que la hicieron.",
          ),
        },
        {
          icon: "star",
          title: L("Authentic Colombian products", "Productos auténticos de Colombia"),
          text: L(
            "Made with traditional techniques and natural materials from the region.",
            "Hechos con técnicas tradicionales y materiales naturales de la región.",
          ),
        },
        {
          icon: "shield",
          title: L("Secure purchase", "Compra segura"),
          text: L(
            "Protected checkout and careful handling of your order.",
            "Checkout protegido y un manejo cuidadoso de tu pedido.",
          ),
        },
        {
          icon: "globe",
          title: L("Shipping worldwide", "Envíos a todo el mundo"),
          text: L(
            "We deliver Colombian craft to your door, anywhere.",
            "Llevamos el oficio colombiano hasta tu puerta, donde estés.",
          ),
        },
        {
          icon: "gift",
          title: L("Special packaging", "Empaque especial"),
          text: L(
            "Each piece arrives wrapped with care and a story to share.",
            "Cada pieza llega envuelta con cuidado y una historia para compartir.",
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
