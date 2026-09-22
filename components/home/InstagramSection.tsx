"use client";

import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Reveal } from "@/components/ui/Reveal";
import { useSocialLinks, instagramOf, hrefFor } from "@/lib/social/use-social-links";
import { Icon } from "@/components/ui/icons";

interface InstagramSectionProps {
  section: Extract<HomeSection, { kind: "instagram" }>;
  locale: Locale;
}

export function InstagramSection({ section, locale }: InstagramSectionProps) {
  const dict = getDictionary(locale);
  const { links } = useSocialLinks();
  const insta = instagramOf(links);
  const instaUrl = insta ? hrefFor("instagram", insta.value) : null;
  const handle = insta?.label || section.handle || "Instagram";
  const s = dict.social;
  // When a specific post URL is configured, tiles use it (https-only, enforced
  // server-side); otherwise the main URL.
  const tileHref = insta?.post_url && /^https:\/\//i.test(insta.post_url) ? insta.post_url : instaUrl;

  return (
    <section className="section section--alt">
      <div className="container">
        <div className="section-head section-head--split insta-head">
          <div>
            <span className="eyebrow">{section.eyebrow}</span>
            {instaUrl ? (
              <h2 className="h2 section-head__title">
                <a
                  href={instaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${section.title} (${handle})`}
                  className="insta-head__link"
                >
                  {section.title}
                </a>
              </h2>
            ) : (
              <h2 className="h2 section-head__title">{section.title}</h2>
            )}
            {instaUrl && (
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="insta-handle"
                aria-label={`Instagram ${handle}`}
              >
                <Icon name="instagram" size={14} /> {handle}
              </a>
            )}
            {!instaUrl && (
              <p className="insta-empty-note">{s.emptySearch}</p>
            )}
          </div>
          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--sm insta-follow"
              aria-label={s.followAria(handle)}
            >
              <Icon name="instagram" size={15} /> {s.followLabel}
            </a>
          )}
        </div>

        <div className="insta-grid">
          {!instaUrl ? (
            <p className="insta-empty-note insta-empty-note--block">
              {s.feedNote}{" "}
              <a href="https://instagram.com/arem.world" target="_blank" rel="noopener noreferrer">
                @arem.world
              </a>
            </p>
          ) : (
            section.tileImages.map((src, index) => {
              const tileLabel = s.openProfile(handle);
              const img = <ManagedImage src={src} alt={`Instagram ${handle}`} />;
              const tile = instaUrl && tileHref ? (
                <a
                  key={src}
                  href={tileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="insta-tile"
                  aria-label={tileLabel}
                >
                  {img}
                  <span className="insta-tile__overlay">
                    <Icon name="instagram" size={16} />
                  </span>
                </a>
              ) : (
                <div key={src} className="insta-tile is-static">
                  {img}
                </div>
              );
              return (
                <Reveal key={src} delay={Math.min(index, 5) * 60}>
                  {tile}
                </Reveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
