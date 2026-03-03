import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@postago/shared"],
  typescript: {
    // We run type checks separately, ignoring here to speed up/unblock Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
