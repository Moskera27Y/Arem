"use client";

import { useEffect, useState } from "react";

export interface SocialLinkPublic {
  id: string;
  network: string;
  label: string | null;
  value: string;
  active: boolean;
  display_order: number;
  post_url: string | null;
}

let cache: SocialLinkPublic[] | null = null;
let promise: Promise<SocialLinkPublic[]> | null = null;

function fetchLinks(): Promise<SocialLinkPublic[]> {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = fetch("/api/social-links")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        cache = Array.isArray(rows) ? rows : [];
        return cache;
      })
      .catch(() => {
        cache = [];
        return cache;
      });
  }
  return promise;
}

/** Active public social links (Neon), cached for the page session. */
export function useSocialLinks(): { links: SocialLinkPublic[]; loading: boolean } {
  const [links, setLinks] = useState<SocialLinkPublic[]>(cache ?? []);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetchLinks()
      .then((l) => {
        if (alive) setLinks(l);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  return { links, loading };
}

/** Build a safe public href from a network + configured value. */
export function hrefFor(network: string, value: string): string {
  if (network === "email") return `mailto:${value}`;
  if (network === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return `https://wa.me/${digits.startsWith("57") ? digits : `57${digits}`}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/** The active Instagram link, if any. */
export function instagramOf(links: SocialLinkPublic[]): SocialLinkPublic | null {
  return links.find((l) => l.network === "instagram" && l.active) ?? null;
}
