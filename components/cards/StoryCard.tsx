import Link from "next/link";
import type { Story } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/format";
import { ManagedImage } from "@/components/ui/ManagedImage";

interface StoryCardProps {
  story: Story;
  locale: Locale;
}

export function StoryCard({ story, locale }: StoryCardProps) {
  return (
    <article className="story-card">
      <div className="story-card__media">
        <Link href={`/${locale}/stories/${story.slug}`} tabIndex={-1} aria-hidden="true">
          <ManagedImage src={story.image.src} alt={story.image.alt} />
        </Link>
      </div>
      <div className="story-card__body">
        <span className="story-card__meta">
          {story.category} · {formatDate(story.date, locale)} · {story.readTime}
        </span>
        <h3 className="story-card__title">
          <Link href={`/${locale}/stories/${story.slug}`}>{story.title}</Link>
        </h3>
        <p className="story-card__dek">{story.dek}</p>
      </div>
    </article>
  );
}
