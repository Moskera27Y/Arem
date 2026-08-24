import Link from "next/link";
import type { HomeSection } from "@/lib/types";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/icons";

interface CraftsmanshipProps {
  section: Extract<HomeSection, { kind: "craftsmanship" }>;
}

export function Craftsmanship({ section }: CraftsmanshipProps) {
  return (
    <section className="section">
      <div className="container">
        <div className="split split--reverse">
          <div className="split__media">
            <Reveal>
              <ManagedImage src={section.image.src} alt={section.image.alt} />
            </Reveal>
          </div>
          <div>
            <p className="eyebrow split__kicker">{section.eyebrow}</p>
            <h2 className="h2 split__title">{section.title}</h2>
            <div className="split__body">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <div className="stat">
              <span className="stat__value">{section.statValue}</span>
              <span className="stat__label">{section.statLabel}</span>
            </div>
            <div className="split__cta">
              <Link href={section.cta.href} className="btn btn--primary">
                {section.cta.label} <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
