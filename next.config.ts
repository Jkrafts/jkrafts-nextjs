import type { NextConfig } from "next";
import { isIndexable } from "./lib/seo";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['jkrafts-landing.test'],
  // Belt and braces with the robots meta tag and robots.txt: outside
  // production deploys, every response says noindex in its headers too, so
  // a deploy preview can't be indexed even from a link someone shares.
  async headers() {
    if (isIndexable) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
