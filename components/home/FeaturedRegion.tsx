import Link from "next/link";
import { getRegionById } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { AremImage } from "@/components/ui/AremImage";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/icons";

interface FeaturedRegionProps {
  section: Extract<HomeSection, { kind: "featured-region" }>;
  locale: Locale;
}

export function FeaturedRegion({ section, locale }: FeaturedRegionProps) {
  const region = getRegionById(locale, section.regionId);
  if (!region) return null;

  return (
    <section className="section section--alt">
      <div className="container">
        <div className="split">
          <div className="split__media">
            <Reveal>
              <AremImage src={region.image.src} alt={region.image.alt} />
            </Reveal>
          </div>
          <div>
            <p className="eyebrow split__kicker">{section.eyebrow}</p>
            <h2 className="h2 split__title">{section.title}</h2>
            <p className="region-card__dept" style={{ marginBottom: "1.25rem" }}>
              {region.department}
            </p>
            <div className="split__body">
              <p>{section.body}</p>
            </div>
            <ul className="region-facts" style={{ marginTop: "2rem" }}>
              {region.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <div className="split__cta">
              <Link href={`/${locale}${section.cta.href}`} className="btn btn--primary">
                {section.cta.label} <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
