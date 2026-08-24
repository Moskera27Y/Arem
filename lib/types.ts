/**
 * AREM WORLD — domain types.
 *
 * The whole storefront is driven by this normalized, id-referenced content
 * model. Nothing is hardcoded around fixed categories or fixed homepage
 * sections: an Admin panel will later edit the same entities (products,
 * categories, collections, regions, artisans, stories, homepage) stored in a
 * database, and `lib/content` is the single seam where the static
 * implementation would be swapped for that data source.
 */

export type Currency = "COP" | "USD";

export interface Money {
  /** Amount in the currency's main unit (e.g. 320000 = $320.000 COP). */
  amount: number;
  currency: Currency;
}

export interface ImageRef {
  src: string;
  alt: string;
  caption?: string;
}

export type ProductStatus = "active" | "draft" | "archived";

/** A selectable product attribute (Color, Size, Presentación...). */
export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

/** A concrete purchasable unit: SKU + price + inventory. */
export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  optionValues: Record<string, string>;
  price: Money;
  compareAtPrice?: Money;
  inventory: number;
  /** Optional image override for this variant. */
  imageSrc?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Long-form product story paragraphs. */
  story: string[];
  /** Bullet details (materials, care, origin). */
  details: string[];
  images: ImageRef[];
  price: Money;
  compareAtPrice?: Money;
  options: ProductOption[];
  variants: ProductVariant[];
  categoryIds: string[];
  collectionIds: string[];
  regionId?: string;
  artisanId?: string;
  featured?: boolean;
  badge?: string;
  status: ProductStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  image: ImageRef;
  order: number;
  featured?: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  image: ImageRef;
  productIds: string[];
  featured?: boolean;
  order: number;
}

export interface Region {
  id: string;
  slug: string;
  name: string;
  department: string;
  description: string;
  highlights: string[];
  image: ImageRef;
  order: number;
}

export interface Artisan {
  id: string;
  slug: string;
  name: string;
  craft: string;
  regionId: string;
  bio: string;
  quote: string;
  image: ImageRef;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string[];
  image: ImageRef;
  category: string;
  regionId?: string;
  artisanId?: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

/* ------------------------------------------------------------------ */
/* Homepage — sectioned, admin-controllable                            */
/* ------------------------------------------------------------------ */

export interface CtaLink {
  label: string;
  href: string;
}

export type HomeSection = { id: string } & (
  | {
      kind: "hero";
      eyebrow: string;
      title: string;
      titleAccent: string;
      subtitle: string;
      primaryCta: CtaLink;
      secondaryCta: CtaLink;
      image: ImageRef;
    }
  | {
      kind: "featured-categories";
      eyebrow: string;
      title: string;
      subtitle: string;
      categoryIds: string[];
    }
  | {
      kind: "featured-products";
      eyebrow: string;
      title: string;
      subtitle: string;
      productIds: string[];
    }
  | {
      kind: "craftsmanship";
      eyebrow: string;
      title: string;
      body: string[];
      image: ImageRef;
      statLabel: string;
      statValue: string;
      cta: CtaLink;
    }
  | {
      kind: "featured-region";
      eyebrow: string;
      title: string;
      body: string;
      regionId: string;
      cta: CtaLink;
    }
  | {
      kind: "brand-story";
      eyebrow: string;
      title: string;
      body: string[];
      quote: string;
      quoteAuthor: string;
      image: ImageRef;
    }
  | {
      kind: "instagram";
      eyebrow: string;
      title: string;
      handle: string;
      tileImages: string[];
    }
  | {
      kind: "newsletter";
      eyebrow: string;
      title: string;
      subtitle: string;
    }
  | {
      kind: "stories-inspire";
      eyebrow: string;
      title: string;
      sub: string;
      cta: CtaLink;
      storyIds: string[];
    }
  | {
      kind: "why-shop";
      title: string;
      sub: string;
      items: { icon: string; title: string; text: string }[];
    }
);

export interface Homepage {
  announcementItems: string[];
  sections: HomeSection[];
}

/* ------------------------------------------------------------------ */
/* Site configuration                                                  */
/* ------------------------------------------------------------------ */

export interface SiteNavLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  brandName: string;
  brandTagline: string;
  nav: SiteNavLink[];
  footer: {
    about: string;
    columns: { title: string; links: SiteNavLink[] }[];
    contact: { label: string; value: string }[];
    socials: { label: string; href: string }[];
    bottom: string;
  };
  currency: Currency;
}

/* ------------------------------------------------------------------ */
/* Cart / wishlist (client-side, no checkout yet)                      */
/* ------------------------------------------------------------------ */

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}
