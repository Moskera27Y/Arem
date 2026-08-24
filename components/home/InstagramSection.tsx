import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { HomeSection } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Icon } from "@/components/ui/icons";

interface InstagramSectionProps {
  section: Extract<HomeSection, { kind: "instagram" }>;
  locale: Locale;
}

export function InstagramSection({ section, locale }: InstagramSectionProps) {
  return (
    <section className="section section--alt">
      <div className="container">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          action={
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary btn--sm"
            >
              <Icon name="instagram" size={15} /> {section.handle}
            </a>
          }
        />
        <div className="insta-grid">
          {section.tileImages.map((src, index) => (
            <a
              key={src}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="insta-tile"
              aria-label={`Instagram post ${index + 1} of ${section.handle} (${locale})`}
            >
              <ManagedImage src={src} alt={`Instagram ${section.handle} — post ${index + 1}`} />
              <span className="insta-tile__overlay">
                <Icon name="instagram" size={16} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
