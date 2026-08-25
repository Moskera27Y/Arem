"use client";

import { useSocialLinks, hrefFor } from "@/lib/social/use-social-links";
import { Icon } from "@/components/ui/icons";

/** Footer social section — renders only the active, Admin-managed social links
 * from Neon, with accessible icons/labels. Renders nothing when none are set. */
export function FooterSocials() {
  const { links } = useSocialLinks();
  if (links.length === 0) return null;

  return (
    <div className="footer__socials">
      {links.map((link) => {
        const href = hrefFor(link.network, link.value);
        const label = link.label || link.network;
        const isEmail = href.startsWith("mailto:");
        return (
          <a
            key={link.id}
            href={href}
            target={isEmail ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="footer__social"
            aria-label={`${label} — ${link.network}`}
            title={label}
          >
            <Icon name={link.network === "instagram" ? "instagram" : "link"} size={14} />
            {label}
          </a>
        );
      })}
    </div>
  );
}
