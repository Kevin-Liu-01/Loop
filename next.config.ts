import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ["@chenglou/pretext"],
};

export default nextConfig;
