import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStories } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { StoryCard } from "@/components/cards/StoryCard";
import { Reveal } from "@/components/ui/Reveal";

interface StoriesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: StoriesPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : ("en" as Locale);
  const dict = getDictionary(locale);
  return { title: dict.nav.stories, description: dict.stories.sub };
}

export default async function StoriesPage({ params }: StoriesPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const items = getStories(locale);
  const [featured, ...rest] = items;

  return (
    <div className="stories-page">
      <section className="page-hero page-hero--dark">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <Link href={localePrefix}>{dict.common.home}</Link>
            <span className="breadcrumbs__sep">/</span>
            <span>{dict.nav.stories}</span>
          </nav>
          <p className="eyebrow page-hero__eyebrow">{dict.stories.eyebrow}</p>
          <h1 className="page-hero__title">{dict.stories.title}</h1>
          <p className="page-hero__sub">{dict.stories.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {featured && (
            <Reveal>
              <article
                className="collection-hero stories-featured"
                style={{ marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                <div className="collection-hero__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.image.src}
                    alt={featured.image.alt}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    width={1920}
                    height={800}
                  />
                </div>
                <div className="collection-hero__body">
                  <span className="badge badge--light stories-featured__badge" style={{ marginBottom: "0.9rem" }}>
                    {dict.stories.featuredBadge}
                  </span>
                  <h2 className="collection-hero__title">{featured.title}</h2>
                  <p className="collection-hero__sub">{featured.dek}</p>
                  <div style={{ marginTop: "1.5rem" }}>
                    <Link href={`${localePrefix}/stories/${featured.slug}`} className="btn btn--gold-dark">
                      {dict.stories.readStory}
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          )}

          <div className="grid grid--3 stories-index">
            {rest.map((story, index) => (
              <Reveal key={story.id} delay={Math.min(index, 8) * 70}>
                <StoryCard story={story} locale={locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
