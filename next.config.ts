import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Allow optimized remote images served from Vercel Blob (Admin uploads).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  poweredByHeader: false,
  // Pin file tracing to this project instead of the auto-inferred workspace root.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
