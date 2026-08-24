import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // Pin file tracing to this project instead of the auto-inferred workspace
  // root (a stray lockfile above the project made Next infer an invalid Windows
  // path, which broke Vercel's function bundling of the middleware).
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
