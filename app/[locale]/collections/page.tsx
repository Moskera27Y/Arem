import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollections } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { Reveal } from "@/components/ui/Reveal";

interface CollectionsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CollectionsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return {
    title: dict.nav.collections,
    description: dict.collections.sub,
  };
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;
  const items = getCollections(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.collections}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.collections.eyebrow}</p>
          <h1 className="page-hero__title">{dict.collections.title}</h1>
          <p className="page-hero__sub">{dict.collections.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--2">
            {items.map((collection, index) => (
              <Reveal key={collection.id} delay={index * 80}>
                <CollectionCard collection={collection} locale={locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
