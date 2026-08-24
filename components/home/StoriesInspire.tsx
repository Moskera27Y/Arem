import Link from "next/link";
import { getRegionById, getStories } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";

interface StoriesInspireProps {
  section: Extract<HomeSection, { kind: "stories-inspire" }>;
  locale: Locale;
}

/**
 * "Stories that inspire" — a mixed editorial section: intro text on the left,
 * three image story cards (dark overlay) on the right. Driven by the
 * centralized Stories + Regions data.
 */
export function StoriesInspire({ section, locale }: StoriesInspireProps) {
  const localePrefix = `/${locale}`;
  const stories = section.storyIds
    .map((id) => getStories(locale).find((s) => s.id === id))
    .filter(Boolean);

  return (
    <section className="section section--stories">
      <div className="container stories-inspire">
        <div className="stories-inspire__intro">
          <span className="eyebrow">{section.eyebrow}</span>
          <h2 className="h2 stories-inspire__title">{section.title}</h2>
          <p className="stories-inspire__sub">{section.sub}</p>
          <Link href={`${localePrefix}${section.cta.href}`} className="btn btn--secondary">
            {section.cta.label} <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className="stories-inspire__grid">
          {stories.map((story) => {
            if (!story) return null;
            const region = getRegionById(locale, story.regionId);
            return (
              <Link
                key={story.id}
                href={`${localePrefix}/stories/${story.slug}`}
                className="story-hero-card"
              >
                <div className="story-hero-card__media">
                  <ManagedImage src={story.image.src} alt={story.image.alt} />
                </div>
                <div className="story-hero-card__body">
                  {region && <span className="story-hero-card__region">{region.name}</span>}
                  <h3 className="story-hero-card__title">{story.title}</h3>
                  <span className="story-hero-card__link">
                    Read story <Icon name="arrow-right" size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
