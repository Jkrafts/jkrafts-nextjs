import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

/**
 * Runs scripts/seo-audit.mjs against the production build under test
 * (CONTEXT=production in playwright.config.ts): status codes, titles,
 * descriptions, canonicals, Open Graph, JSON-LD, headings, internal links,
 * assets, robots.txt and the sitemap. Any error-level finding fails.
 */
test('the production build passes the SEO audit', async ({ baseURL }) => {
  test.setTimeout(120_000);
  const run = promisify(execFile);
  const result = await run('node', ['scripts/seo-audit.mjs', baseURL!, '--mode', 'production']).catch(
    (e: { stdout: string; code: number }) => e,
  );
  console.log(result.stdout);
  expect(result.stdout).toContain('0 errors');
});

test('pages declare their production canonical and indexability', async ({ page }) => {
  await page.goto('/projects?story=liqa');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.jkrafts.com/projects');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index, follow/);
  const res = await page.request.get('/about');
  expect(res.headers()['x-robots-tag']).toBeUndefined();
});
