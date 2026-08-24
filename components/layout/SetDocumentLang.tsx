"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

/** Syncs <html lang> with the active locale after hydration. */
export function SetDocumentLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
