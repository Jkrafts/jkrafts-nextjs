import { test, expect } from '@playwright/test';
import { PAGES, collectConsole } from './helpers';

test.describe('Console errors & basic page health', () => {
  for (const path of PAGES) {
    test(`page ${path} loads without console errors`, async ({ page }) => {
      const { messages, pageErrors } = collectConsole(page);

      const response = await page.goto(path, { waitUntil: 'networkidle' });
      expect(response?.status(), `HTTP status for ${path}`).toBeLessThan(400);

      // Let animations/effects settle.
      await page.waitForTimeout(1500);

      const errors = messages.filter((m) => m.type === 'error');
      if (errors.length || pageErrors.length) {
        console.log(`\n--- Console/page errors on ${path} ---`);
        errors.forEach((e) => console.log('[console.error]', e.text, e.location ?? ''));
        pageErrors.forEach((e) => console.log('[pageerror]', e));
      }

      expect(errors, `console.error calls on ${path}`).toEqual([]);
      expect(pageErrors, `uncaught exceptions on ${path}`).toEqual([]);
    });
  }

  test('duplicate DOM ids on home page (a11y / anchor hazard)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const dupIds = await page.evaluate(() => {
      const seen = new Map<string, number>();
      document.querySelectorAll('[id]').forEach((el) => {
        seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      });
      return Array.from(seen.entries()).filter(([, count]) => count > 1);
    });
    console.log('Duplicate ids found on "/":', dupIds);
    expect(dupIds, 'duplicate ids on the home page').toEqual([]);
  });
});
