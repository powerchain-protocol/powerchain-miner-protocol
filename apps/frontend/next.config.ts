import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@powerchain/design-system"],
  experimental: {
    optimizePackageImports: ["@powerchain/design-system"],
  },
};

export default nextConfig;
