import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getCollections, getProducts } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arem-mu.vercel.app";
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    urls.push({ url: `${base}/${locale}`, lastModified: now, changeFrequency: "daily", priority: 1 });
    for (const p of ["/shop", "/collections", "/about", "/contact", "/tracking"]) {
      urls.push({ url: `${base}/${locale}${p}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const pr of getProducts(locale)) {
      urls.push({
        url: `${base}/${locale}/products/${pr.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        images: pr.images.slice(0, 3).map((img) => (img.src.startsWith("http") ? img.src : `${base}${img.src}`)),
      });
    }
    for (const c of getCollections(locale)) {
      urls.push({ url: `${base}/${locale}/collections/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    }
  }
  return urls;
}
