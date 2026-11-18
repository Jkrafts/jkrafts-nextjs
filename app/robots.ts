import type { MetadataRoute } from "next";
import { SITE_URL, isIndexable } from "@/lib/seo";

/**
 * Production: crawl everything except the API. Anything else (Netlify deploy
 * previews, branch deploys, local builds): crawl nothing. See isIndexable.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
