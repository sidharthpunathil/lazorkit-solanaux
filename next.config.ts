import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@solana/web3.js", "@lazorkit/wallet"],
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Ensure @lazorkit/wallet resolves correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      "@lazorkit/wallet": require.resolve("@lazorkit/wallet"),
    };
    return config;
  },
  // Serve VitePress docs from public/docs
  // Next.js automatically serves static files from public/ directory
  // Files in public/docs/ will be accessible at /docs/*
};

export default nextConfig;
