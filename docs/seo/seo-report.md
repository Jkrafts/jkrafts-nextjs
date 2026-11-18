# SEO and deployment report: jkrafts.com

Production URL: **https://www.jkrafts.com** (Netlify primary domain; `https://jkrafts.com` 308-redirects to it, observed 17 Nov 2026).

Each phase records where its results came from. Nothing here claims the site is indexed or ranking: that can only be confirmed in Google Search Console.

| Phase | Environment | Status |
|---|---|---|
| A | Local production build (`next build` + `next start`) | Done, 17 Nov 2026 |
| B | Netlify configuration review (repository only) | Done, 17 Nov 2026 |
| C | Netlify Deploy Preview | Waiting for authorisation to push |
| D | Production readiness | After C |
| E | Live production + Search Console | After merge |

How to re-run the audit against any copy of the site:

```bash
npm run seo:audit -- http://localhost:3000                                  # local, production mode
npm run seo:audit -- https://<preview>.netlify.app --mode preview           # deploy preview
npm run seo:audit -- https://www.jkrafts.com --json seo-production.json     # production
```

`scripts/seo-audit.mjs` is dependency-free. It fetches the raw HTML a crawler receives (no JavaScript), follows every internal link, and checks status codes, redirects, titles, descriptions, canonicals, robots directives (meta and `X-Robots-Tag`), Open Graph/Twitter, JSON-LD, `<h1>` count, image `alt`, every referenced asset, `robots.txt`, the sitemap (every URL must return 200) and the 404 status. It exits 1 on any error. `e2e/seo.spec.ts` runs it against the production build on every test run.

---

## Phase A: local (verified locally)

### Baseline audit, before changes: 81 errors, 1 warning

| # | Finding | Impact |
|---|---|---|
| 1 | Every production URL used `https://jkrafts.com`, which 308-redirects to `www`: sitemap (9 URLs), robots.txt `Sitemap:`, `metadataBase` (so every `og:url`/`og:image`), security.txt | Search engines were pointed at redirecting URLs |
| 2 | No canonical tag on any page | `/projects?story=…` (5) and `/contact?project=…` (5) were crawlable duplicates of their pages |
| 3 | Pages that set `openGraph` lost `og:type` and `og:url` (Next replaces the parent's `openGraph`, it doesn't merge) | Incomplete link previews |
| 4 | Legal pages inherited the root `og:title` ("Jkrafts") and `og:url` (home page) | Shared legal links previewed as the home page |
| 5 | No structured data | No explicit Organization/WebSite entity |
| 6 | No protection against indexing deploy previews or branch deploys | Preview URLs could be indexed if discovered |
| 7 | `/terms` description 40 characters | Weak search snippet |

Already fine: every page 200, unknown URLs 404 (with `noindex`), one `<h1>` per page, unique titles, `<html lang="en">`, every asset loads, no internal link redirects.

### Changes

- `lib/seo/index.ts`: `SITE_URL = https://www.jkrafts.com` as the single source of truth; `isIndexable` (true only when Netlify's build sets `CONTEXT=production`, or `SEO_INDEXABLE=true`); `pageMetadata()` builds complete metadata per page (title, description, canonical, full Open Graph and Twitter); `organizationJsonLd()`.
- Every page uses `pageMetadata()` with its own path, so `?story=`/`?project=` variants canonicalise to the plain page.
- `app/layout.tsx`: `metadataBase` on `www`; `robots` meta `index, follow` (with `max-image-preview: large`) in production, `noindex, nofollow` otherwise.
- `app/robots.ts`: production allows all except `/api/` and lists the `www` sitemap; non-production disallows everything.
- `app/sitemap.ts`: the 9 indexable pages on `www`, no query variants, no `/api`. `lastModified` removed (it changed on every build, which teaches search engines to ignore it).
- `next.config.ts`: `X-Robots-Tag: noindex, nofollow` on every response when not indexable.
- Home page: Organization + WebSite JSON-LD (name, URL, logo, email, telephone, social profiles).
- `/terms` description expanded; descriptions reviewed for length (all 50–160 characters).
- `public/.well-known/security.txt`: `Policy`/`Canonical` on `www`.

### Results after changes

**Production-mode build** (`CONTEXT=production`): **0 errors, 0 warnings.**

- 19 URLs crawled (9 pages + 10 query variants), all HTTP 200; 29 assets, all 200.
- Canonicals: every page `https://www.jkrafts.com/<path>`; query variants canonicalise to their plain page.
- robots.txt: `Allow: /`, `Disallow: /api/`, `Sitemap: https://www.jkrafts.com/sitemap.xml`.
- sitemap.xml: 9 URLs, all on `www`, all 200.
- No `X-Robots-Tag`; robots meta `index, follow`.
- JSON-LD on `/`: Organization, WebSite (parses as valid JSON; schema validity still to be checked with Google's Rich Results Test in Phase C).
- Unknown URL: HTTP 404.

**Deploy-preview-mode build** (`CONTEXT=deploy-preview`, audited with `--mode preview`): **0 errors, 0 warnings.**

- robots.txt: `Disallow: /`, no sitemap line.
- Every page: `<meta name="robots" content="noindex, nofollow">` and `X-Robots-Tag: noindex, nofollow`.
- Canonicals and sitemap still on `https://www.jkrafts.com`, never the preview host.

**Local build without `CONTEXT`**: noindex by default.

**Test suite** (production build, `CONTEXT=production`, machine load average 11–14 during the runs):

- Lint: 0 errors.
- Full suite: 58 of 60 passed; `e2e/seo.spec.ts` (the audit plus a canonical/robots check) passed.
- The 2 failures were timing under load, not regressions: the nav-indicator test clicked before hydration, and the Plasma test measured before its lazily loaded canvas existed. Both passed on an immediate rerun.
- In that rerun the headline hand-off test once measured 1.5 px against its 1 px limit; it then passed 10 of 10. No animation code changed in this work.

---

## Phase B: Netlify preparation (verified in the repository; not yet on Netlify)

| Check | Result |
|---|---|
| Next.js compatibility | Regular Next.js 16 App Router app (no `output: 'export'`); Netlify's Next.js runtime builds it. `netlify.toml`: `npm run build`, publish `.next`, Node 22. All pages prerender; only `/api/contact` is dynamic (runs as a function). |
| Redirects / rewrites | None in the repo: no `_redirects`, `_headers` or `[[redirects]]`, so no obsolete SPA catch-all (`/* /index.html 200`) that would turn 404s into 200s. The bare→www redirect is Netlify's domain setting. |
| Headers | `netlify.toml` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. `X-Robots-Tag` comes from `next.config.ts` and is build-context aware. |
| Environment variables | `LARAVEL_API_URL` (required) and `LARAVEL_API_TOKEN` (optional), scope Functions. `CONTEXT` is set by Netlify automatically; don't set it manually. `NEXT_PUBLIC_LARAVEL_API_URL` is unused and should be deleted. `.env*` is git-ignored and not tracked. |
| Production domain | Code uses `https://www.jkrafts.com` everywhere (canonical, Open Graph, sitemap, robots, JSON-LD, security.txt). |
| Preview indexing | Blocked three ways (robots.txt, robots meta, `X-Robots-Tag`) for `deploy-preview` and `branch-deploy` contexts, verified locally above. |
| Preview canonicals | Always the production URL, verified locally above. |

### To confirm on Netlify (needs dashboard access)

- Primary domain is `www.jkrafts.com` and `jkrafts.com` redirects to it (observed: 308).
- The default `*.netlify.app` address redirects to the primary domain, or at least serves the `www` canonical (it does, since canonicals are fixed in the code).
- The site's Build settings don't override `netlify.toml` with an old publish directory such as `out`.
- Production branch is the branch you merge into, so its builds get `CONTEXT=production`.

---

## Outstanding (not blocking)

- **Testimonials, FAQ terms and legal placeholders** are still filler or bracketed: replace before relying on them publicly.
- **Unused files in `public/`** (`projects/admin`, `projects/business`, `projects/pos`, `scrollFlip_*.png`, `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`, the old `*-black.png`/`*-white.png` icons): not linked anywhere, so not crawled, but they ship with every deploy.
- **FAQ structured data** was deliberately not added: Google only shows FAQ rich results for a small set of authoritative government and health sites, and the answers are still filler.
- **Performance** (mobile and desktop) can't be measured meaningfully on this machine; measure on the deploy preview in Phase C (PageSpeed Insights / Lighthouse).
