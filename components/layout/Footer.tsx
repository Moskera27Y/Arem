import Link from "next/link";
import { getSiteConfig } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Logo } from "@/components/ui/Logo";
import { FooterSocials } from "@/components/layout/FooterSocials";
import { FooterBackground } from "@/components/layout/FooterBackground";

export function Footer({ locale }: { locale: Locale }) {
  const site = getSiteConfig(locale);
  const dict = getDictionary(locale);
  const { footer } = site;
  return (
    <footer className="footer">
      <FooterBackground />
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo variant="light" href={`/${locale}`} />
            <p className="footer__signoff">
              {locale === "en" ? (
                <>
                  Handmade in Colombia, <em>for the world.</em>
                </>
              ) : (
                <>
                  Hecho a mano en Colombia, <em>para el mundo.</em>
                </>
              )}
            </p>
            <p className="footer__about">{footer.about}</p>
            <FooterSocials fallback={footer.socials} />
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="footer__title">{column.title}</h3>
              <ul className="footer__links">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={`/${locale}${link.href}`} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="footer__title">{dict.footer.contact}</h3>
            <div className="footer__contact">
              {footer.contact.map((item) => (
                <div key={item.label}>
                  <strong>{item.label}</strong>
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{footer.bottom}</span>
          <span>{dict.footer.bottomNote}</span>
        </div>
      </div>
    </footer>
  );
}
