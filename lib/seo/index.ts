import type { Metadata } from "next";
// Relative, not "@/": next.config.ts imports this file too.
import { contact, socials } from "../site";

/**
 * The production address. Always this, whatever host a build is served
 * from, so canonicals, Open Graph URLs and the sitemap never point at a
 * deploy preview. Netlify's primary domain is www (the bare domain
 * redirects to it with a 308).
 */
export const SITE_URL = "https://www.jkrafts.com";

/**
 * Whether search engines may index this build. Netlify sets CONTEXT at
 * build time: "production" for the production branch, "deploy-preview" or
 * "branch-deploy" otherwise. Anything that isn't a production deploy
 * (previews, branch deploys, local builds) is noindex: robots.txt disallows
 * everything, every page carries `noindex`, and next.config.ts adds an
 * `X-Robots-Tag: noindex` header. SEO_INDEXABLE=true forces indexing on,
 * for testing production behaviour locally.
 */
export const isIndexable =
  process.env.CONTEXT === "production" || process.env.SEO_INDEXABLE === "true";

export const siteConfig = {
  name: "Jkrafts",
  url: SITE_URL,
  description:
    "Jkrafts designs and builds websites, web apps and business systems that bring in enquiries and save teams time.",
  ogImage: "/og/default.png",
};

/**
 * Complete metadata for a page: title, description, canonical, Open Graph
 * and Twitter, all pointing at the production URL of `path`. Use it for
 * every page. Next replaces (doesn't merge) a parent's `openGraph`, so a
 * page that set only some Open Graph fields would silently lose the rest.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  image = siteConfig.ogImage,
  absoluteTitle = false,
}: {
  /** Shown as "<title> | Jkrafts" unless `absoluteTitle`. */
  title: string;
  description: string;
  /** Production path, e.g. "/about". Query strings never belong here. */
  path: string;
  /** Title for link previews, if it should differ from `title`. */
  socialTitle?: string;
  image?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const shared = socialTitle ?? title;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_GB",
      url: path,
      title: shared,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: shared }],
    },
    twitter: {
      card: "summary_large_image",
      title: shared,
      description,
      images: [image],
    },
  };
}

/** Organization and WebSite structured data, for the home page. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: siteConfig.name,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        description: siteConfig.description,
        email: contact.email,
        telephone: contact.phoneDisplay.replace(/\s/g, ""),
        sameAs: socials.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteConfig.name,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}
