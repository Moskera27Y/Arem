"use client";

import { useAnnouncements } from "@/lib/admin/storefront-hooks";
import { useLocale } from "@/lib/i18n/locale-context";
import { Icon } from "@/components/ui/icons";

interface AnnouncementBarProps {
  /** Default announcement items (server-rendered baseline). */
  items: string[];
}

/**
 * Announcement bar — a slim black bar with three short messages separated
 * visually, merged with active promotions (announcement / free-shipping)
 * from the centralized Admin store.
 */
export function AnnouncementBar({ items }: AnnouncementBarProps) {
  const locale = useLocale();
  const announcements = useAnnouncements();
  const extras = announcements.map((a) => a.text[locale]).filter(Boolean);

  const all = [...items, ...extras].filter(Boolean).slice(0, 6);

  return (
    <div className="announce" role="region" aria-label="Announcement">
      {all.map((message, index) => (
        <span key={message} className="announce__item">
          {index > 0 && <Icon name="heart" size={10} className="announce__sep" />}
          {message}
        </span>
      ))}
    </div>
  );
}
