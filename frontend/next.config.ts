import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    maxSize: 50,
  },
};

export default nextConfig;
