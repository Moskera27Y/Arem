import Link from "next/link";
import type { Collection } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { AremImage } from "@/components/ui/AremImage";
import { Icon } from "@/components/ui/icons";

interface CollectionCardProps {
  collection: Collection;
  locale: Locale;
  /** Optional product count override (already localized by the caller). */
  count?: number;
}

export function CollectionCard({ collection, locale, count }: CollectionCardProps) {
  const dict = getDictionary(locale);
  const pieces = count ?? collection.productIds.length;
  return (
    <Link href={`/${locale}/collections/${collection.slug}`} className="category-card">
      <div className="category-card__media">
        <AremImage src={collection.image.src} alt={collection.image.alt} />
      </div>
      <div className="category-card__body">
        <span className="badge badge--light" style={{ marginBottom: "0.75rem", alignSelf: "flex-start" }}>
          {dict.common.pieces(pieces)}
        </span>
        <h3 className="category-card__name">{collection.name}</h3>
        <span className="category-card__link">
          {dict.common.viewCollection} <Icon name="arrow-right" size={13} />
        </span>
      </div>
    </Link>
  );
}
