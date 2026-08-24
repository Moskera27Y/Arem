import Link from "next/link";
import type { Region } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { ManagedImage } from "@/components/ui/ManagedImage";

interface RegionCardProps {
  region: Region;
  locale: Locale;
}

export function RegionCard({ region, locale }: RegionCardProps) {
  return (
    <Link href={`/${locale}/regions/${region.slug}`} className="region-card">
      <div className="region-card__media">
        <ManagedImage src={region.image.src} alt={region.image.alt} />
      </div>
      <div className="region-card__body">
        <h3 className="region-card__name">{region.name}</h3>
        <span className="region-card__dept">{region.department}</span>
      </div>
    </Link>
  );
}
