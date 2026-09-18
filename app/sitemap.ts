import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getCollections, getProducts, getRegions, getStories } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arem-mu.vercel.app";
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    urls.push({ url: `${base}/${locale}`, lastModified: now, changeFrequency: "daily", priority: 1 });
    for (const p of ["/shop", "/collections", "/about", "/stories", "/regions", "/contact"]) {
      urls.push({ url: `${base}/${locale}${p}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const pr of getProducts(locale)) {
      urls.push({ url: `${base}/${locale}/products/${pr.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const c of getCollections(locale)) {
      urls.push({ url: `${base}/${locale}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    }
    for (const s of getStories(locale)) {
      urls.push({ url: `${base}/${locale}/stories/${s.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const r of getRegions(locale)) {
      urls.push({ url: `${base}/${locale}/regions/${r.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return urls;
}
