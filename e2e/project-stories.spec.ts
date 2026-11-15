import { test, expect } from '@playwright/test';

/**
 * Project tiles and the story viewer.
 *
 * The four "process" images in /public/projects are byte-identical stock
 * photos, so project visuals are derived from data guaranteed unique per
 * project (accent colour + title monogram) rather than image assets.
 */
test.describe('Project stories', () => {
  test('tiles are distinct and deterministic (colour + monogram, no shared image)', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' });

    const read = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('.story-tile')).map((el) => ({
          bg: getComputedStyle(el).backgroundColor,
          mono: el.querySelector('.story-tile-monogram')?.textContent?.trim(),
          imgs: el.querySelectorAll('img').length,
        })),
      );

    const tiles = await read();
    expect(tiles.length).toBeGreaterThan(1);
    expect(tiles.every((t) => t.imgs === 0)).toBe(true);
    expect(new Set(tiles.map((t) => t.bg)).size).toBe(tiles.length);
    expect(new Set(tiles.map((t) => t.mono)).size).toBe(tiles.length);

    await page.reload({ waitUntil: 'networkidle' });
    expect(await read()).toEqual(tiles);
  });

  test('tiles are already card-sized before Swiper initialises (no jump on refresh)', async ({ browser }) => {
    const geometry = async (javaScriptEnabled: boolean, width: number) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled });
      const page = await ctx.newPage();
      await page.goto('/projects', { waitUntil: 'networkidle' });
      await page.waitForTimeout(javaScriptEnabled ? 600 : 100);
      const boxes = await page.evaluate(() =>
        [...document.querySelectorAll('.projects-swiper .swiper-slide')].slice(0, 3).map((el) => {
          const r = el.getBoundingClientRect();
          return [Math.round(r.left), Math.round(r.width), Math.round(r.height)];
        }),
      );
      await ctx.close();
      return boxes;
    };
    // One width per Swiper breakpoint (1.2 / 2.2 / 3.2 / 4.2 slides).
    for (const width of [390, 700, 1100, 1440]) {
      expect(await geometry(false, width)).toEqual(await geometry(true, width));
    }
  });

  test('the projects page does not overflow horizontally', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' });
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(client);
  });

  test('opening a story is an accessible dialog with keyboard control', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' });
    const viewer = page.locator('.stories-slider');
    await expect(viewer).toHaveAttribute('inert', '');

    const tile = page.locator('.story-tile').nth(1);
    await tile.click();
    await page.waitForTimeout(600);

    await expect(viewer).toHaveAttribute('role', 'dialog');
    await expect(viewer).not.toHaveAttribute('inert', '');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Close story');

    const activeChapter = () =>
      page.evaluate(() =>
        document
          .querySelector('.stories-slider > .swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active .story-chapter')
          ?.textContent?.trim(),
      );
    const before = await activeChapter();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    expect(await activeChapter()).not.toBe(before);

    // Focus follows to the chapter that's showing, not a hidden one.
    const focusInActiveChapter = () =>
      page.evaluate(() =>
        !!document
          .querySelector('.stories-slider > .swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active')
          ?.contains(document.activeElement),
      );
    expect(await focusInActiveChapter()).toBe(true);
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Close story');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(viewer).toHaveAttribute('inert', '');
    await expect(tile).toBeFocused();
  });

  const activeStoryTitle = (page: import('@playwright/test').Page) =>
    page.evaluate(
      () =>
        document.querySelector(
          '.stories-slider > .swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active .stories-slider-user-name',
        )?.textContent,
    );

  test('a work row lifts into its story and closes back into the row', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/', { waitUntil: 'networkidle' });
    const row = page.locator('a[data-story="pos-system"]');
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const before = await row.boundingBox();

    await row.click();
    // The overlay covers the home page before the route changes.
    await expect(page.locator('.story-transition')).toHaveCount(1);
    expect(new URL(page.url()).pathname).toBe('/');

    await page.waitForURL('**/projects?story=pos-system');
    await expect(page.locator('.story-transition')).toHaveCount(0, { timeout: 4000 });
    const viewer = page.locator('.stories-slider');
    await expect(viewer).not.toHaveAttribute('inert', '');
    expect(await activeStoryTitle(page)).toBe('Offline POS System');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Close story');

    // Closing returns to the home page, with the row where it was and focused.
    await page.keyboard.press('Escape');
    await page.waitForURL((url) => url.pathname === '/');
    await expect(page.locator('.story-transition')).toHaveCount(0, { timeout: 4000 });
    await expect(row).toBeFocused();
    const after = await row.boundingBox();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(2);

    // Scrolling is unlocked again.
    const y = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(y);
    expect(errors).toEqual([]);
  });

  test('closing a story returns home after an in-page link (e.g. #work) was used', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'See selected work' }).click();
    await page.waitForURL('**/#work');
    await page.waitForTimeout(1200);

    await page.locator('a[data-story="pos-system"]').click();
    await page.waitForURL('**/projects?story=pos-system');
    await expect(page.locator('.story-transition')).toHaveCount(0, { timeout: 4000 });

    await page.locator('.swiper-slide-active .swiper-slide-active .stories-slider-close-button').click();
    await page.waitForURL('**/#work');
    // The home page is actually rendered again, and the overlay clears with
    // the animation rather than via its failsafe.
    await expect(page.locator('.work-index')).toBeVisible({ timeout: 1500 });
    await expect(page.locator('.story-tile')).toHaveCount(0);
    await expect(page.locator('.story-transition')).toHaveCount(0, { timeout: 1500 });
    await expect(page.locator('a[data-story="pos-system"]')).toBeInViewport();
  });

  test('slide colours and patterns survive Swiper wiping slide styles', async ({ page }) => {
    // Swiper's destroy() removes every slide's style attribute (it runs
    // whenever the slider is re-created, e.g. React dev double effects), so
    // the accent and pattern must not live there.
    await page.goto('/projects', { waitUntil: 'networkidle' });
    await page.locator('.story-tile').nth(1).click();
    await page.waitForTimeout(600);
    const surface = () =>
      page.evaluate(() => {
        const el = document.querySelector(
          '.stories-slider > .swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active .story-surface',
        )!;
        return { bg: getComputedStyle(el).backgroundColor, pattern: getComputedStyle(el, '::before').backgroundImage };
      });
    const before = await surface();
    expect(before.bg).toBe('rgb(67, 56, 202)'); // Offline POS accent
    expect(before.pattern).toContain('data:image/svg+xml');

    await page.evaluate(() =>
      document.querySelectorAll('.stories-slider .swiper-slide').forEach((s) => s.removeAttribute('style')),
    );
    expect(await surface()).toEqual(before);
  });

  test('a story stays on its project and waits on the call to action', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' });
    const tile = page.locator('.story-tile').nth(1);
    await tile.click();
    await page.waitForTimeout(600);
    const viewer = page.locator('.stories-slider');

    // Back on the first chapter does nothing.
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(600);
    expect(await activeStoryTitle(page)).toBe('Offline POS System');

    // Forward through the last chapter (the call to action) closes it.
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(250);
    }
    await expect(page.locator('.swiper-slide-active .swiper-slide-active .story-cta')).toHaveText(
      'Start a similar project',
    );
    expect(await activeStoryTitle(page)).toBe('Offline POS System');

    // Autoplay finishes the last chapter (5s) without closing or moving on,
    // and the chapter becomes an end card: copy centred, pattern cleared.
    await page.waitForTimeout(6500);
    await expect(viewer).not.toHaveAttribute('inert', '');
    expect(await activeStoryTitle(page)).toBe('Offline POS System');
    await expect(page.locator('.swiper-slide-active .swiper-slide-active .story-cta')).toBeInViewport();
    const endCard = await page.evaluate(() => {
      const slide = document.querySelector(
        '.stories-slider > .swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active',
      )!;
      const items = [...slide.querySelector('.story-slide')!.children];
      const frame = slide.getBoundingClientRect();
      const middle = (items[0].getBoundingClientRect().top + items.at(-1)!.getBoundingClientRect().bottom) / 2;
      return {
        complete: slide.hasAttribute('data-complete'),
        offCentre: Math.abs(middle - (frame.top + frame.height / 2)),
        pattern: getComputedStyle(slide.querySelector('.story-surface')!, '::before').opacity,
      };
    });
    expect(endCard.complete).toBe(true);
    expect(endCard.offCentre).toBeLessThan(2);
    expect(endCard.pattern).toBe('0');

    // Tapping past it is an explicit exit.
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await expect(viewer).toHaveAttribute('inert', '');
    await expect(tile).toBeFocused();
  });

  test('"Start a similar project" opens the contact form for that project', async ({ page }) => {
    await page.goto('/projects?story=pos-system', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(250);
    }
    await page.locator('.swiper-slide-active .swiper-slide-active .story-cta').click();
    await page.waitForURL('**/contact?project=pos-system#project-form');

    await expect(page.getByRole('textbox', { name: 'Subject' })).toHaveValue('A project like Offline POS System');
    await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused();
    await expect(page.locator('#project-form')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.classList.contains('story-open'))).toBe(false);
  });

  test('chapter entrances play, clean up after themselves, and respect reduced motion', async ({ page }) => {
    const challenge = () =>
      page.evaluate(() => {
        const slide = document.querySelector(
          '.stories-slider > .swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active',
        )!;
        const statement = slide.querySelector('[data-chapter="challenge"] .story-statement');
        return {
          isChallenge: !!statement,
          caret: !!statement?.querySelector('.story-caret'),
          hiddenChars: [...(statement?.querySelectorAll<HTMLElement>('*') ?? [])].filter(
            (el) => getComputedStyle(el).visibility === 'hidden',
          ).length,
          text: statement?.textContent?.trim(),
        };
      });

    await page.goto('/projects?story=pos-system', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.keyboard.press('ArrowRight');
    // Mid-typing: caret showing, characters still hidden. Polled rather than
    // timed, so a busy machine can't land before the chapter changes.
    await expect.poll(async () => (await challenge()).isChallenge && (await challenge()).caret, { intervals: [30] }).toBe(true);
    expect((await challenge()).hiddenChars).toBeGreaterThan(0);

    // Leaving the chapter restores its markup exactly.
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    const left = await page.evaluate(
      () => document.querySelectorAll('.story-caret, .stories-slider [data-chapter] .story-statement div').length,
    );
    expect(left).toBe(0);

    // Reduced motion: chapters show complete, with nothing hidden or moving.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects?story=pos-system', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    const still = await challenge();
    expect(still.caret).toBe(false);
    expect(still.hiddenChars).toBe(0);
    expect(still.text).toBe('The business needed a POS system that works reliably even when connectivity is unstable.');
  });

  test('browser Back during a story leaves no overlay or scroll lock', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('a[data-story="saas-dashboard"]').click();
    await page.waitForURL('**/projects?story=saas-dashboard');
    await expect(page.locator('.story-transition')).toHaveCount(0, { timeout: 4000 });

    await page.goBack();
    await page.waitForURL((url) => url.pathname === '/');
    await page.waitForTimeout(500);
    await expect(page.locator('.story-transition')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.classList.contains('story-open'))).toBe(false);
  });

  test('with reduced motion the row is a plain deep link', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('a[data-story="pos-system"]').click();
    await page.waitForURL('**/projects?story=pos-system');
    await expect(page.locator('.story-transition')).toHaveCount(0);
    await page.waitForTimeout(600);
    expect(await activeStoryTitle(page)).toBe('Offline POS System');

    // Not entered through the transition: closing stays on /projects and
    // drops the query so a refresh doesn't reopen it.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const url = new URL(page.url());
    expect(url.pathname).toBe('/projects');
    expect(url.search).toBe('');
  });

  test('index page survives repeated navigation cycles without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

    for (let i = 0; i < 3; i++) {
      for (const path of ['/', '/about', '/projects']) {
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
      }
    }
    await page.goto('/', { waitUntil: 'networkidle' });
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(120);
    }
    expect(errors).toEqual([]);
  });
});
