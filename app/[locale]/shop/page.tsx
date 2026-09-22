import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveProducts, getCategories, getCategoryBySlug, getRegions } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ShopFilters, type ShopFilterCategory, type ShopFilterRegion } from "@/components/shop/ShopFilters";
import { ShopCategoryChips } from "@/components/shop/ShopCategoryChips";
import { ShopGrid } from "@/components/shop/ShopGrid";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; sort?: string; q?: string; sale?: string; region?: string }>;
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

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { category: categorySlug, sort: sortParam, q: qParam, sale: saleParam, region: regionParam } = await searchParams;

  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const activeSlug = categorySlug && getCategoryBySlug(locale, categorySlug) ? categorySlug : null;
  const activeRegion = regionParam && getRegions(locale).find((r) => r.slug === regionParam) ? regionParam : null;
  const sort = sortParam ?? "featured";
  const query = (qParam ?? "").trim().slice(0, 80);
  const saleOnly = saleParam === "1";

  const all = getActiveProducts(locale);
  const byCategory = activeSlug
    ? all.filter((p) => p.categoryIds.includes(getCategoryBySlug(locale, activeSlug)?.id ?? ""))
    : all;
  const nq = norm(query);
  const byQuery = nq
    ? byCategory.filter((p) => norm(`${p.name} ${p.slug} ${p.categoryIds.join(" ")}`).includes(nq))
    : byCategory;
  const visible = saleOnly
    ? byQuery.filter((p) => p.compareAtPrice && p.compareAtPrice.amount > p.price.amount)
    : byQuery;

  // Region filter (territory of origin)
  const regionList = getRegions(locale);
  const visibleByRegion = activeRegion
    ? visible.filter((p) => p.regionId === regionList.find((r) => r.slug === activeRegion)?.id)
    : visible;

  const sorted = [...visibleByRegion];
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

  const filterRegions: ShopFilterRegion[] = regionList.map((region) => ({
    slug: region.slug,
    name: region.name,
    count: all.filter((p) => p.regionId === region.id).length,
  }));

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <div className="container shop-hero__inner">
          <nav className="breadcrumbs shop-hero__crumbs" aria-label={dict.a11y.breadcrumbs}>
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.shop}</span>
          </nav>
          <p className="eyebrow shop-hero__eyebrow">{dict.shop.eyebrow}</p>
          <h1 className="shop-hero__title">
            {activeCategory ? activeCategory.name : dict.shop.allTitle}
          </h1>
          <p className="shop-hero__sub">
            {activeCategory ? activeCategory.description : dict.shop.allSub}
          </p>
          <p className="shop-hero__count">
            <span className="shop-hero__count-pill">{dict.shop.count(sorted.length)}</span>
          </p>
        </div>
      </section>

      <ShopCategoryChips
        categories={filterCategories}
        activeSlug={activeSlug}
        total={all.length}
        allLabel={dict.shop.all}
        navLabel={dict.shop.categories}
        localePrefix={localePrefix}
      />

      <section className="section">
        <div className="container">
          <div className="shop-layout">
            <ShopFilters
              categories={filterCategories}
              regions={filterRegions}
              activeSlug={activeSlug}
              activeRegion={activeRegion}
              sort={sort}
              query={query}
              saleOnly={saleOnly}
              localePrefix={localePrefix}
            />
            <div className="shop-main">
              <ShopGrid
                products={sorted}
                locale={locale}
                sort={sort}
                activeSlug={activeSlug}
                query={query}
                saleOnly={saleOnly}
                localePrefix={localePrefix}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
