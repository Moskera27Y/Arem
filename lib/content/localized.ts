/**
 * Localization helpers shared by content modules.
 * Content entities store both languages inline (`{ en, es }`) and are
 * resolved to a plain object for the active locale — the same shape an
 * Admin-managed database would later provide per locale.
 */

import type { Locale } from "@/lib/i18n/config";

export type Localized = { en: string; es: string };

export const L = (en: string, es: string): Localized => ({ en, es });

export type LocalizedImage = {
  src: string;
  alt: Localized;
  caption?: Localized;
};

export const pick = (value: Localized, locale: Locale): string => value[locale];

export function pickImage(image: LocalizedImage, locale: Locale) {
  return {
    src: image.src,
    alt: pick(image.alt, locale),
    caption: image.caption ? pick(image.caption, locale) : undefined,
  };
}
