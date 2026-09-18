import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import "@/components/customer/customer.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--arem-serif",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--arem-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://arem-mu.vercel.app"),
  title: {
    default: "AREM WORLD — Colombian craft, curated for the world",
    template: "%s · AREM WORLD",
  },
  description:
    "AREM WORLD curates the best of Colombian craftsmanship — coffee, mochilas, ceramics, textiles and more — made by hand, told with pride.",
  keywords: ["Colombia", "artesanía", "handmade", "café colombiano", "mochilas wayuu", "cerámica"],
  openGraph: {
    title: "AREM WORLD",
    description: "Colombian craft, curated for the world.",
    type: "website",
    locale: "en_US",
    images: [{ url: "/images/hero-main.svg", width: 1920, height: 860, alt: "AREM WORLD — Colombian craftsmanship" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AREM WORLD",
    description: "Colombian craft, curated for the world.",
    images: ["/images/hero-main.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        {/* LCP: hero + logo discovered immediately, no waiting for CSS/JS */}
        <link rel="preload" href="/images/hero-brand.svg" as="image" fetchPriority="high" />
        <link rel="preload" href="/brand/arem-world-logo.svg" as="image" fetchPriority="high" />
        {/* Future remote photography (Vercel Blob) */}
        <link rel="preconnect" href="https://vercel-blob.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
