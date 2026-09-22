import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import "@/components/customer/customer.css";
import { JsonLd } from "@/components/ui/JsonLd";

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
    default: "AREM WORLD — Colombian craft from workshop to world",
    template: "%s · AREM WORLD",
  },
  description:
    "Colombian craft from workshop to the world. Handmade pieces, told with pride.",
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
        {/* Structured data: Organization + contact */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "AREM WORLD",
            url: "https://arem-mu.vercel.app",
            logo: "https://arem-mu.vercel.app/brand/arem-world-logo.svg",
            description:
              "Colombian craft from workshop to the world. Handmade pieces, told with pride.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Carrera 7 # 45-12",
              addressLocality: "Bogotá",
              addressRegion: "Cundinamarca",
              postalCode: "000000",
              addressCountry: "CO",
            },
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+57 302 747 2998",
                email: "hola@arem.world",
                contactType: "customer service",
                language: ["en", "es"],
                areaServed: "CO",
              },
            ],
            sameAs: ["https://instagram.com/arem.world"],
          }}
        />
        {/* LCP: logo discovered immediately (hero raster preloads itself
            via next/image priority, avoiding a duplicate download) */}
        <link rel="preload" href="/brand/arem-world-logo.svg" as="image" fetchPriority="high" />
        {/* Future remote photography (Vercel Blob) */}
        <link rel="preconnect" href="https://vercel-blob.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
