"use client";

import { SOCIAL_LINK_LABELS, useActiveSocialLinks } from "@/lib/admin/storefront-hooks";
import { Icon } from "@/components/ui/icons";

interface FooterSocialsProps {
  /** Static fallback rendered before hydration (site seed socials). */
  fallback: { label: string; href: string }[];
}

function hrefFor(network: string, value: string): string {
  if (network === "email") return `mailto:${value}`;
  if (network === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return `https://wa.me/${digits.startsWith("57") ? digits : `57${digits}`}`;
  }
  if (/^https?:\/\//.test(value)) return value;
  return `https://${value}`;
}

/**
 * Footer social section — merges the centralized Admin social links
 * (active + ordered). Before hydration it renders the static fallback so
 * server markup stays intact.
 */
export function FooterSocials({ fallback }: FooterSocialsProps) {
  const links = useActiveSocialLinks();

  const rendered =
    links.length > 0
      ? links.map((link) => ({
          key: link.id,
          label: link.label ?? SOCIAL_LINK_LABELS[link.network],
          href: hrefFor(link.network, link.value),
          network: link.network,
        }))
      : fallback.map((social, index) => ({
          key: social.href + index,
          label: social.label,
          href: social.href,
          network: social.label.toLowerCase(),
        }));

  return (
    <div className="footer__socials">
      {rendered.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target={social.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="footer__social"
        >
          <Icon name={social.network === "instagram" ? "instagram" : "link"} size={14} />
          {social.label}
        </a>
      ))}
    </div>
  );
}
