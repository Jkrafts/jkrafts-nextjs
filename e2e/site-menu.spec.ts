import { test, expect } from '@playwright/test';

/**
 * Mobile site menu (full-screen panel below 768px).
 *
 * Carries over the regressions covered for the previous StaggeredMenu:
 *  - the menu must close after navigating (the header lives in a persistent
 *    layout and is never unmounted by route changes);
 *  - repeated / rapid toggling must never desync the button's
 *    aria-expanded from the panel's open state;
 * and adds the accessibility behaviour of the new dialog.
 */
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const wrapper = '.site-header-wrapper';

test.describe('Site menu (mobile)', () => {
  test('mobile pages hydrate without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    for (const path of ['/', '/about', '/projects', '/contact']) {
      await page.goto(path, { waitUntil: 'networkidle' });
    }
    // React #418/#425 etc. were thrown here when the custom cursor rendered
    // differently on the server and on touch devices.
    expect(errors).toEqual([]);
  });

  test('opens, moves focus into the panel, and closes after navigating', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.waitForTimeout(900);

    await expect(page.locator(wrapper)).toHaveAttribute('data-open', 'true');
    await expect(page.locator('#site-menu')).not.toHaveAttribute('inert', '');
    await expect(page.locator('#site-menu a').first()).toBeFocused();

    const panelBox = await page.locator('#site-menu').boundingBox();
    expect(panelBox?.x ?? 999).toBeLessThanOrEqual(1); // actually on screen

    await Promise.all([
      page.waitForURL('**/about'),
      page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'About' }).click(),
    ]);
    await page.waitForTimeout(700);

    await expect(page.locator(wrapper)).not.toHaveAttribute('data-open', 'true');
    await expect(page.locator('#site-menu')).toHaveAttribute('inert', '');
  });

  test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: /open menu|close menu/i });
    await toggle.click();
    await page.waitForTimeout(600);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('toggle reliably opens and closes across repeated clicks', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: /open menu|close menu/i });

    for (let i = 0; i < 3; i++) {
      await toggle.click();
      await page.waitForTimeout(700);
      await expect(page.locator(wrapper)).toHaveAttribute('data-open', 'true');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await toggle.click();
      await page.waitForTimeout(700);
      await expect(page.locator(wrapper)).not.toHaveAttribute('data-open', 'true');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('aria-expanded and data-open never disagree, even under rapid clicks', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: /open menu|close menu/i });

    await toggle.click();
    await page.waitForTimeout(100);
    await toggle.click();
    await page.waitForTimeout(100);
    await toggle.click();
    await page.waitForTimeout(1200);

    const dataOpen = await page.locator(wrapper).getAttribute('data-open');
    const ariaExpanded = await toggle.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe(dataOpen === 'true' ? 'true' : 'false');
  });
});
