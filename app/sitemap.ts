import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Every indexable page, always on the production domain (also in preview
 * builds, so a preview can never advertise its own URLs). Query-string
 * variants (/projects?story=…, /contact?project=…) are left out: their
 * canonical is the plain page. No lastModified: a date that changes on
 * every build is worse than none, because search engines learn to ignore it.
 */
const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/projects", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.8 },
  { path: "/privacy", priority: 0.2 },
  { path: "/cookies", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
  { path: "/security", priority: 0.2 },
  { path: "/licenses", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    priority,
  }));
}
