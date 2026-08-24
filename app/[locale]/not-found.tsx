"use client";

import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

export default function NotFound() {
  const locale = useLocale();
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  return (
    <section className="section" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="container text-center">
        <p className="eyebrow eyebrow--center" style={{ justifyContent: "center" }}>
          {dict.notFound.code}
        </p>
        <h1 className="display" style={{ marginTop: "1rem" }}>
          {dict.notFound.title}
        </h1>
        <p className="muted" style={{ maxWidth: "32rem", margin: "1.25rem auto 2rem" }}>
          {dict.notFound.sub}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={localePrefix} className="btn btn--primary">
            {dict.notFound.home}
          </Link>
          <Link href={`${localePrefix}/shop`} className="btn btn--secondary">
            {dict.notFound.exploreShop}
          </Link>
        </div>
      </div>
    </section>
  );
}
