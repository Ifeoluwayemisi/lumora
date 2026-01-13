import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  swcMinify: true, // Use SWC minification (default in Next.js 13+)

  // On-demand entries configuration for better performance
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 seconds
    maxSize: 50,
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    return [];
  },

  // Environment variables available in browser (public)
  env: {
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },
};

export default nextConfig;
