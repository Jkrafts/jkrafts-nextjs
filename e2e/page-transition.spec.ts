import { test, expect, type Page } from '@playwright/test';

/**
 * The page transition (lib/pageTransition.ts): a grid curtain covers the
 * page under the header, the route changes underneath, then the curtain
 * lifts with the new page's headline handed over in place.
 */

/**
 * Records, on every frame while the curtain shows its copy of the new
 * headline, the largest offset between the copy and the real headline,
 * compared letter by letter. Measured inside the page, because the copy is
 * only up for a fraction of a second and polling from the test can miss it
 * on a busy machine. Read the result with `readHandoff`.
 */
const watchHandoff = (page: Page) =>
  page.evaluate(() => {
    const glyphs = (root: Element) => {
      const out: [number, number][] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
        for (let i = 0; i < n.data.length; i++) {
          if (!n.data[i].trim()) continue;
          const range = document.createRange();
          range.setStart(n, i);
          range.setEnd(n, i + 1);
          const b = range.getBoundingClientRect();
          out.push([b.left, b.top]);
        }
      }
      return out;
    };
    const state = { frames: 0, last: Infinity };
    (window as unknown as { __handoff: typeof state }).__handoff = state;
    const started = performance.now();
    const tick = () => {
      const copy = document.querySelector('.page-transition h1');
      const real = document.querySelector('main h1');
      if (copy && real) {
        const a = glyphs(copy);
        const b = glyphs(real);
        state.frames++;
        state.last =
          a.length === b.length
            ? Math.max(...a.map((p, i) => Math.max(Math.abs(p[0] - b[i][0]), Math.abs(p[1] - b[i][1]))))
            : Infinity;
      }
      if (performance.now() - started < 8000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const readHandoff = (page: Page) =>
  page.evaluate(() => (window as unknown as { __handoff: { frames: number; last: number } }).__handoff);

test.describe('Page transition', () => {
  for (const [from, to, label] of [
    ['/contact', '/about', 'inner page'],
    ['/about', '/', 'home hero'],
  ] as const) {
    test(`covers, changes route, and hands the headline over in place (${label})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(from, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      await watchHandoff(page);
      await page.locator(`header a[href="${to}"]`).first().click();
      // Covered first: the old page is still the route while the curtain rises.
      await expect(page.locator('.page-transition')).toHaveCount(1);
      expect(new URL(page.url()).pathname).toBe(from);

      await page.waitForURL((url) => url.pathname === to);
      await expect(page.locator('.page-transition')).toHaveCount(0, { timeout: 3000 });

      // The copy was shown, and by its last frame (lines risen, curtain
      // lifted) it sat exactly on the real headline.
      const handoff = await readHandoff(page);
      expect(handoff.frames).toBeGreaterThan(0);
      expect(handoff.last).toBeLessThan(1);
      await expect(page.locator('main h1')).toBeFocused();
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test('the header stays above the curtain and the nav underline slides to the new link', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const about = page.locator('.site-nav a[href="/about"]');
    const box = (await about.boundingBox())!;
    await about.click();
    await page.waitForTimeout(250);

    // The header is still hit-testable above the overlay, with white text.
    const onTop = await page.evaluate(
      ([x, y]) => !!document.elementFromPoint(x, y)?.closest('.site-header'),
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(onTop).toBe(true);
    await expect(page.locator('html')).toHaveClass(/pt-header/);

    // One underline, travelling from Contact towards About.
    const indicator = page.locator('.site-nav-indicator');
    await expect(indicator).toHaveCount(1);
    await page.waitForURL('**/about');
    await expect(page.locator('.page-transition')).toHaveCount(0, { timeout: 3000 });
    await expect(indicator).toHaveCount(0);
    await expect(about).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('html')).not.toHaveClass(/pt-header/);
  });

  test('a link clicked mid-transition is followed once it finishes', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });
    await page.locator('.site-nav a[href="/about"]').click();
    await page.waitForTimeout(250);
    // The header is above the curtain, so this is still clickable.
    await page.locator('.site-nav a[href="/projects"]').click();
    await page.waitForURL('**/projects', { timeout: 6000 });
    await expect(page.locator('.page-transition')).toHaveCount(0, { timeout: 3000 });
    await expect(page.locator('main h1')).toHaveText('Project stories');
  });

  test('the curtain rises first under the pointer', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.locator('a.site-logo').click(); // far left
    await page.waitForTimeout(160);
    const [first, last] = await page.evaluate(() => {
      const cols = [...document.querySelectorAll<HTMLElement>('.page-transition > div')].filter(
        (c) => c.style.background.includes('75, 50, 224') || c.style.backgroundColor === 'rgb(75, 50, 224)',
      );
      const y = (c: HTMLElement) => c.getBoundingClientRect().top;
      return [y(cols[0]), y(cols[cols.length - 1])];
    });
    // The leftmost column (under the click) is higher than the rightmost.
    expect(first).toBeLessThan(last);
  });

  test('reduced motion: a quick fade, no curtain or headline copy', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact', { waitUntil: 'networkidle' });
    await page.locator('header a[href="/about"]').click();
    await page.waitForURL('**/about');
    expect(await page.locator('.page-transition h1').count()).toBe(0);
    await expect(page.locator('.page-transition')).toHaveCount(0, { timeout: 1000 });
  });

  test('back/forward and same-page links skip the curtain', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });
    await page.locator('header a[href="/about"]').click();
    await page.waitForURL('**/about');
    await expect(page.locator('.page-transition')).toHaveCount(0, { timeout: 3000 });

    await page.goBack();
    await page.waitForURL('**/contact');
    expect(await page.locator('.page-transition').count()).toBe(0);

    await page.locator('header a[href="/contact"]').click();
    await page.waitForTimeout(200);
    expect(await page.locator('.page-transition').count()).toBe(0);
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test('menu links transition and the menu is closed on arrival', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.locator('.menu-toggle').tap();
      await page.waitForTimeout(900);
      await page.locator('#site-menu a[href="/projects"]').tap();
      await expect(page.locator('.page-transition')).toHaveCount(1);
      await page.waitForURL('**/projects');
      await expect(page.locator('.page-transition')).toHaveCount(0, { timeout: 3000 });
      await expect(page.locator('#site-menu')).toHaveAttribute('inert', '');
      await expect(page.locator('main h1')).toHaveText('Project stories');
    });
  });
});
