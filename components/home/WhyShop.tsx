import type { HomeSection } from "@/lib/types";
import { Icon, type IconName } from "@/components/ui/icons";

interface WhyShopProps {
  section: Extract<HomeSection, { kind: "why-shop" }>;
}

const ICON_SET: string[] = ["heart", "star", "shield", "globe", "gift"];

/**
 * "Why shop at AREM WORLD" — a clean, scannable trust section with five
 * line icons and concise bilingual copy.
 */
export function WhyShop({ section }: WhyShopProps) {
  return (
    <section className="section section--why">
      <div className="container">
        <div className="why-head">
          <h2 className="h2">{section.title}</h2>
          {section.sub && <p className="why-head__sub">{section.sub}</p>}
        </div>
        <ul className="trust-row">
          {section.items.map((item, index) => {
            const icon = (ICON_SET.includes(item.icon) ? item.icon : "star") as IconName;
            return (
              <li key={item.title} className="trust-item">
                <span className="trust-item__icon">
                  <Icon name={icon} size={26} strokeWidth={1.4} />
                </span>
                <h3 className="trust-item__title">{item.title}</h3>
                <p className="trust-item__text">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
