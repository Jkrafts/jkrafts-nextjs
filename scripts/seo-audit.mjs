#!/usr/bin/env node
// SEO audit for a running copy of the site (local, Netlify preview or
// production). Dependency-free: it fetches the raw HTML a crawler receives
// (no JavaScript), follows every internal link it finds, and checks status
// codes, redirects, titles, descriptions, canonicals, robots directives,
// Open Graph/Twitter tags, JSON-LD, headings, images and assets, robots.txt
// and the sitemap.
//
// Usage:
//   node scripts/seo-audit.mjs <base-url> [--mode production|preview]
//                              [--canonical https://www.jkrafts.com]
//                              [--json report.json]
//
//   --mode production  (default) pages must be indexable, robots.txt must
//                      allow crawling, sitemap/canonicals use --canonical.
//   --mode preview     every page must be noindex (meta and header) and
//                      robots.txt must disallow everything, while canonicals
//                      still point at --canonical (never at the preview).
//
// Exits 1 if any error-level issue is found.

const args = process.argv.slice(2);
const base = new URL(args.find((a) => !a.startsWith('--')) ?? 'http://localhost:3000');
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : fallback;
};
const mode = flag('mode', 'production');
const canonicalOrigin = new URL(flag('canonical', 'https://www.jkrafts.com')).origin;
const jsonOut = flag('json', null);

const issues = [];
const issue = (level, where, message) => issues.push({ level, where, message });
const pages = new Map();
const assetStatus = new Map();

// --- Tiny HTML helpers (enough for head tags and links) -------------------

const attrs = (tag) => {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = m[3] ?? m[4];
  return out;
};
const decode = (s) =>
  s
    ?.replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => attrs(m[0]));
const meta = (html, key, value) => decode(tags(html, 'meta').find((t) => t[key] === value)?.content);
const text = (s) => decode(s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());

// Both forms of the production domain (www and bare), so a URL on the wrong
// one is reported rather than fetched from the live site during a local run.
const bareHost = new URL(canonicalOrigin).hostname.replace(/^www\./, '');
const isProductionHost = (u) => u.hostname === bareHost || u.hostname === `www.${bareHost}`;

/** Map a production URL onto the server being audited (for local runs). */
const onTarget = (url) => {
  const u = new URL(url, base);
  if (isProductionHost(u)) return new URL(u.pathname + u.search, base);
  return u;
};

async function get(url, { method = 'GET' } = {}) {
  const res = await fetch(url, { method, redirect: 'manual', headers: { 'User-Agent': 'jkrafts-seo-audit' } });
  return res;
}

async function checkAsset(url, where) {
  const target = onTarget(url).href;
  if (!assetStatus.has(target)) {
    let status;
    try {
      let res = await get(target, { method: 'HEAD' });
      if (res.status === 405) res = await get(target);
      status = res.status;
    } catch (e) {
      status = `ERR ${e.message}`;
    }
    assetStatus.set(target, status);
  }
  const status = assetStatus.get(target);
  if (status !== 200) issue('error', where, `asset ${url} → ${status}`);
}

// --- Page audit ------------------------------------------------------------

async function auditPage(path) {
  if (pages.has(path)) return;
  pages.set(path, null);
  const url = new URL(path, base);
  const res = await get(url);
  const record = { path, status: res.status, headers: {} };
  for (const h of ['content-type', 'x-robots-tag', 'location', 'cache-control', 'strict-transport-security']) {
    if (res.headers.get(h)) record.headers[h] = res.headers.get(h);
  }
  pages.set(path, record);

  if (res.status >= 300 && res.status < 400) {
    issue('warn', path, `internal link redirects (${res.status} → ${record.headers.location})`);
    return;
  }
  if (res.status !== 200) {
    issue('error', path, `HTTP ${res.status}`);
    return;
  }
  const html = await res.text();
  const head = html.slice(0, html.indexOf('</head>') + 7);

  record.title = text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  record.description = meta(head, 'name', 'description');
  record.robots = meta(head, 'name', 'robots');
  record.canonical = decode(tags(head, 'link').find((t) => t.rel === 'canonical')?.href);
  record.lang = attrs(html.match(/<html\b[^>]*>/i)?.[0] ?? '').lang;
  record.og = {
    title: meta(head, 'property', 'og:title'),
    description: meta(head, 'property', 'og:description'),
    url: meta(head, 'property', 'og:url'),
    image: meta(head, 'property', 'og:image'),
    type: meta(head, 'property', 'og:type'),
    siteName: meta(head, 'property', 'og:site_name'),
  };
  record.twitter = { card: meta(head, 'name', 'twitter:card'), image: meta(head, 'name', 'twitter:image') };
  const body = html.slice(html.indexOf('</head>'));
  record.h1 = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1]));
  record.jsonLd = [];
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      record.jsonLd.push(...(data['@graph'] ?? [data]).map((d) => d['@type']));
    } catch (e) {
      issue('error', path, `invalid JSON-LD: ${e.message}`);
    }
  }

  // Title and description
  if (!record.title) issue('error', path, 'missing <title>');
  else if (record.title.length > 65) issue('warn', path, `title is ${record.title.length} chars (aim ≤ 60): "${record.title}"`);
  if (!record.description) issue('error', path, 'missing meta description');
  else if (record.description.length > 165 || record.description.length < 50)
    issue('warn', path, `description is ${record.description.length} chars (aim 50–160)`);
  if (!record.lang) issue('error', path, 'missing <html lang>');

  // Canonical
  const expected = canonicalOrigin + (path === '/' ? '/' : path.split('?')[0]);
  if (!record.canonical) issue('error', path, 'missing canonical');
  else if (record.canonical.replace(/\/$/, '') !== expected.replace(/\/$/, ''))
    issue('error', path, `canonical is ${record.canonical}, expected ${expected}`);

  // Indexing
  const noindex = /noindex/i.test(record.robots ?? '') || /noindex/i.test(record.headers['x-robots-tag'] ?? '');
  record.indexable = !noindex;
  if (mode === 'production' && noindex) issue('error', path, `noindex in production (${record.robots ?? record.headers['x-robots-tag']})`);
  if (mode === 'preview') {
    if (!/noindex/i.test(record.robots ?? '')) issue('error', path, 'preview page lacks <meta name="robots" content="noindex">');
    if (!/noindex/i.test(record.headers['x-robots-tag'] ?? '')) issue('error', path, 'preview page lacks X-Robots-Tag: noindex');
  }

  // Social
  for (const [k, v] of Object.entries({ 'og:title': record.og.title, 'og:description': record.og.description, 'og:url': record.og.url, 'og:image': record.og.image, 'og:type': record.og.type, 'twitter:card': record.twitter.card }))
    if (!v) issue('error', path, `missing ${k}`);
  if (record.og.url && new URL(record.og.url).origin !== canonicalOrigin) issue('error', path, `og:url ${record.og.url} is not on ${canonicalOrigin}`);
  if (record.og.image) {
    if (!/^https?:\/\//.test(record.og.image)) issue('error', path, `og:image is not absolute: ${record.og.image}`);
    else if (new URL(record.og.image).origin !== canonicalOrigin) issue('error', path, `og:image ${record.og.image} is not on ${canonicalOrigin}`);
    await checkAsset(record.og.image, path);
  }

  // Headings
  if (record.h1.length !== 1) issue('error', path, `${record.h1.length} <h1> elements (expected 1)`);

  // Images: present in HTML, have alt, load
  for (const img of tags(body, 'img')) {
    if (img.alt === undefined) issue('error', path, `<img src="${img.src}"> has no alt attribute`);
    if (img.src && !img.src.startsWith('data:')) await checkAsset(decode(img.src), path);
  }
  // Same-origin scripts, styles, fonts, icons referenced in <head>
  for (const link of tags(head, 'link')) {
    if (link.href && /stylesheet|preload|icon|manifest/.test(link.rel ?? '') && !/^https?:\/\//.test(link.href)) await checkAsset(decode(link.href), path);
  }
  for (const s of tags(html, 'script')) if (s.src && !/^https?:\/\//.test(s.src)) await checkAsset(decode(s.src), path);

  // Internal links: queue for crawling
  record.links = [];
  for (const a of tags(body, 'a')) {
    if (!a.href) continue;
    const href = decode(a.href);
    if (/^(mailto|tel|javascript):/.test(href) || href.startsWith('#')) continue;
    const u = new URL(href, url);
    if (u.origin !== base.origin && !isProductionHost(u)) continue;
    if (isProductionHost(u) && base.origin !== u.origin) issue('warn', path, `absolute production link in page: ${href}`);
    record.links.push(u.pathname + u.search);
  }
  for (const link of record.links) await auditPage(link);
}

// --- robots.txt and sitemap -------------------------------------------------

async function auditRobots() {
  const res = await get(new URL('/robots.txt', base));
  const body = res.status === 200 ? await res.text() : '';
  const result = { status: res.status, body, sitemaps: [...body.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]) };
  if (res.status !== 200) issue('error', '/robots.txt', `HTTP ${res.status}`);
  const disallowAll = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*$/im.test(body);
  if (mode === 'production' && disallowAll) issue('error', '/robots.txt', 'production robots.txt disallows everything');
  if (mode === 'preview' && !disallowAll) issue('error', '/robots.txt', 'preview robots.txt does not disallow crawling');
  if (mode === 'production') {
    if (!result.sitemaps.length) issue('error', '/robots.txt', 'no Sitemap: line');
    for (const s of result.sitemaps) if (new URL(s).origin !== canonicalOrigin) issue('error', '/robots.txt', `Sitemap ${s} is not on ${canonicalOrigin}`);
  }
  return result;
}

async function auditSitemap() {
  const res = await get(new URL('/sitemap.xml', base));
  const result = { status: res.status, urls: [] };
  if (res.status !== 200) {
    issue('error', '/sitemap.xml', `HTTP ${res.status}`);
    return result;
  }
  const xml = await res.text();
  result.urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!result.urls.length) issue('error', '/sitemap.xml', 'no URLs');
  for (const u of result.urls) {
    if (new URL(u).origin !== canonicalOrigin) issue('error', '/sitemap.xml', `${u} is not on ${canonicalOrigin}`);
    const page = await get(onTarget(u)).catch((e) => ({ status: `ERR ${e.message}` }));
    if (page.status !== 200) issue('error', '/sitemap.xml', `${u} → HTTP ${page.status} (sitemap must list only 200 URLs)`);
  }
  return result;
}

// --- Run ---------------------------------------------------------------------

const robots = await auditRobots();
const sitemap = await auditSitemap();
for (const u of sitemap.urls) await auditPage(new URL(u).pathname);
await auditPage('/');

const notFound = await get(new URL('/this-page-should-not-exist-' + Date.now(), base));
if (notFound.status !== 404) issue('error', '/<missing>', `unknown URL returns ${notFound.status}, expected 404`);
const notFoundHtml = notFound.status === 404 ? await notFound.text() : '';
if (notFound.status === 404 && !/noindex/i.test(notFoundHtml)) issue('warn', '/<missing>', '404 page has no noindex meta');

const crawled = [...pages.values()].filter(Boolean);
const titles = new Map();
for (const p of crawled.filter((p) => p.status === 200 && !p.path.includes('?'))) {
  if (titles.has(p.title)) issue('error', p.path, `duplicate title with ${titles.get(p.title)}: "${p.title}"`);
  else titles.set(p.title, p.path);
}
const inSitemap = new Set(sitemap.urls.map((u) => new URL(u).pathname));
for (const p of crawled)
  if (p.status === 200 && p.indexable && !p.path.includes('?') && !inSitemap.has(p.path))
    issue('warn', p.path, 'indexable page not listed in sitemap');

const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');

console.log(`\nSEO audit: ${base.origin}  (mode: ${mode}, canonical origin: ${canonicalOrigin})\n`);
console.log(`robots.txt  HTTP ${robots.status}; sitemaps: ${robots.sitemaps.join(', ') || 'none'}`);
console.log(`sitemap.xml HTTP ${sitemap.status}; ${sitemap.urls.length} URLs`);
console.log(`404 check   unknown URL → HTTP ${notFound.status}`);
console.log(`assets      ${assetStatus.size} checked, ${[...assetStatus.values()].filter((s) => s !== 200).length} failing\n`);
console.log('Pages:');
for (const p of crawled) {
  console.log(
    `  ${String(p.status).padEnd(4)}${p.path.padEnd(30)} ${p.indexable === false ? 'noindex ' : ''}` +
      `${p.title ? `"${p.title}"` : ''}${p.jsonLd?.length ? `  JSON-LD: ${p.jsonLd.join(', ')}` : ''}`,
  );
}
console.log(`\n${errors.length} errors, ${warns.length} warnings`);
for (const i of [...errors, ...warns]) console.log(`  [${i.level}] ${i.where}: ${i.message}`);

if (jsonOut) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(jsonOut, JSON.stringify({ base: base.origin, mode, canonicalOrigin, robots, sitemap, notFound: notFound.status, pages: crawled, assets: Object.fromEntries(assetStatus), issues }, null, 2));
}
process.exit(errors.length ? 1 : 0);
