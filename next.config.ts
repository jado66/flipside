import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the correct workspace root to avoid lockfile confusion
  outputFileTracingRoot: __dirname,

  // Enable trailing slash for better SEO consistency
  trailingSlash: true,

  // Enable image optimization for better performance
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.cdninstagram.com" }],
    unoptimized: false, // Enable optimization for better Core Web Vitals
    formats: ["image/webp", "image/avif"],
  },

  // Enable compression for better performance
  compress: true,

  // Ensure proper headers for SEO and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
