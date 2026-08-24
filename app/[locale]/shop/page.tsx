import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveProducts, getCategories, getCategoryBySlug } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ShopFilters, type ShopFilterCategory } from "@/components/shop/ShopFilters";
import { ShopGrid } from "@/components/shop/ShopGrid";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return {
    title: dict.nav.shop,
    description: dict.shop.allSub,
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { category: categorySlug, sort: sortParam } = await searchParams;

  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const activeSlug = categorySlug && getCategoryBySlug(locale, categorySlug) ? categorySlug : null;
  const sort = sortParam ?? "featured";

  const all = getActiveProducts(locale);
  const visible = activeSlug
    ? all.filter((p) => p.categoryIds.includes(getCategoryBySlug(locale, activeSlug)?.id ?? ""))
    : all;

  const sorted = [...visible];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, locale));
      break;
    default:
      sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  }

  const filterCategories: ShopFilterCategory[] = getCategories(locale).map((category) => ({
    slug: category.slug,
    name: category.shortName,
    count: all.filter((p) => p.categoryIds.includes(category.id)).length,
  }));

  const activeCategory = activeSlug ? getCategoryBySlug(locale, activeSlug) : null;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.shop}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.shop.eyebrow}</p>
          <h1 className="page-hero__title">
            {activeCategory ? activeCategory.name : dict.shop.allTitle}
          </h1>
          <p className="page-hero__sub">
            {activeCategory ? activeCategory.description : dict.shop.allSub}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="shop-layout">
            <ShopFilters
              categories={filterCategories}
              activeSlug={activeSlug}
              sort={sort}
              localePrefix={localePrefix}
            />
            <div>
              <ShopGrid products={sorted} locale={locale} sort={sort} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
