import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "..", ".."), // apps/web -> apps -> monorepo root
  },
};

export default nextConfig;
