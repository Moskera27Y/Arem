import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { WishlistContent } from "@/components/cart/WishlistContent";

interface WishlistPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: WishlistPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  return { title: getDictionary(locale).wishlist.title };
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow page-hero__eyebrow">{dict.wishlist.yourFavorites}</p>
          <h1 className="page-hero__title">{dict.wishlist.title}</h1>
        </div>
      </section>
      <WishlistContent />
    </>
  );
}
