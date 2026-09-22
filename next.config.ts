import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90],
    deviceSizes: [320, 640, 750, 1080, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    // Allow optimized remote images served from Vercel Blob (Admin uploads).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  poweredByHeader: false,
  // View Transitions: enabled via CSS `view-transition: auto` in globals.css
  // + document.startViewTransition interception in components/ui/ViewTransitions.tsx
  // (No experimental Next.js flag needed beyond the platform default.)
  // Pin file tracing to this project instead of the auto-inferred workspace root.
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // No X-Frame-Options: it would override the CSP allowlist below
          // and re-block the portfolio preview. frame-ancestors is the
          // modern, more precise control (self + CM Studio portfolio only).
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https://*.public.blob.vercel-storage.com https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://api.resend.com https://api.square.co https://*.public.blob.vercel-storage.com; " +
              "frame-ancestors 'self' https://cm-portfolio-beige.vercel.app https://cm-portfolio-cristians-projects-5a37e367.vercel.app; " +
              "base-uri 'self'; " +
              "form-action 'self'",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Long-lived immutable cache for local brand/content imagery.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Ensure WebP images are served with correct content-type for older caches
        source: "/images/:path*.webp",
        headers: [{ key: "Content-Type", value: "image/webp" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:path*.webp",
        headers: [{ key: "Content-Type", value: "image/webp" }],
      },
    ];
  },
};

export default nextConfig;
