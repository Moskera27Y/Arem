"use client";

import { useState } from "react";
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
 * from the centralized Admin store. Marquee pauses via accessible toggle.
 */
export function AnnouncementBar({ items }: AnnouncementBarProps) {
  const locale = useLocale();
  const announcements = useAnnouncements();
  const extras = announcements.map((a) => a.text[locale]).filter(Boolean);
  const [paused, setPaused] = useState(false);

  const all = [...items, ...extras].filter(Boolean).slice(0, 6);

  return (
    <div className="announce" role="region" aria-label="Announcement" data-paused={paused || undefined}>
      <span className="announce__track">
        {all.map((message, index) => (
          <span key={`${message}-${index}`} className="announce__item">
            {index > 0 && <Icon name="heart" size={10} className="announce__sep" />}
            {message}
          </span>
        ))}
        {/* Duplicate for a seamless marquee loop on mobile (hidden on desktop). */}
        <span className="announce__dup" aria-hidden="true">
          {all.map((message, index) => (
            <span key={`dup-${message}-${index}`} className="announce__item">
              <Icon name="heart" size={10} className="announce__sep" />
              {message}
            </span>
          ))}
        </span>
      </span>
      <button
        type="button"
        className="announce__pause"
        aria-pressed={paused}
        aria-label={locale === "es" ? (paused ? "Reanudar anuncios" : "Pausar anuncios") : paused ? "Play announcements" : "Pause announcements"}
        onClick={() => setPaused((v) => !v)}
      >
        <span className="marquee-toggle" data-playing={paused || undefined} aria-hidden="true" />
      </button>
    </div>
  );
}
