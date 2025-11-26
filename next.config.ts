import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
    cacheComponents: true, // substitui ppr
  },
};

export default nextConfig;