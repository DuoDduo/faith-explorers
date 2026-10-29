import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: "standalone",
  images: {
    // Article covers and avatars are served by the API under /media (proxied below),
    // so next/image treats them as local images and can optimize them.
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/media/**", search: "" },
    ],
  },
  async rewrites() {
    return [{ source: "/media/:path*", destination: `${API_URL}/media/:path*` }];
  },
};

export default nextConfig;
