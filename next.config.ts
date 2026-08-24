import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // Pin tracing to this project (a stray lockfile exists in the user home dir).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
