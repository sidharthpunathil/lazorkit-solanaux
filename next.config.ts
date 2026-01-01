import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@solana/web3.js", "@lazorkit/wallet"],
  },
  turbopack: {},
};

export default nextConfig;
