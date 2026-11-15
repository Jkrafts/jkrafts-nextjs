import type { MetadataRoute } from "next";

// Generated once at build time (required by the static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://jkrafts.com/sitemap.xml",
  };
}
