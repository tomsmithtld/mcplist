import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR mode for Cloudflare Workers (no static export)
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js Image Optimization
  },
  // Ensure compatibility with Cloudflare Workers runtime
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
