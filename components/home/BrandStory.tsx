import type { HomeSection } from "@/lib/types";
import { AremImage } from "@/components/ui/AremImage";
import { Reveal } from "@/components/ui/Reveal";

interface BrandStoryProps {
  section: Extract<HomeSection, { kind: "brand-story" }>;
}

export function BrandStory({ section }: BrandStoryProps) {
  return (
    <section className="section">
      <div className="container">
        <div className="split split--reverse">
          <div className="split__media">
            <Reveal>
              <AremImage src={section.image.src} alt={section.image.alt} />
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
            <blockquote className="quote">
              <p className="quote__text">“{section.quote}”</p>
              <footer className="quote__author">— {section.quoteAuthor}</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
