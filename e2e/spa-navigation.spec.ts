import { test, expect } from '@playwright/test';
import { installInstrumentation } from './instrument';
import { snapshotInstrumentation } from './helpers';

/**
 * Verifies whether primary navigation (the StaggeredMenu) performs a Next.js
 * client-side transition or a full document reload. This matters because:
 *  - full reloads wipe all JS state (masking component-level cleanup bugs, but
 *    losing all SPA/prefetch benefits and breaking the "smooth" persistent-Lenis UX)
 *  - client-side transitions rely on effect cleanup functions running correctly,
 *    which is where several components in this app are missing `return () => ...`.
 */
test.describe('Navigation mechanism (client-side vs full reload)', () => {
  test('StaggeredMenu links behavior', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Mark the current document/window so we can detect a full reload.
    await page.evaluate(() => {
      (window as any).__navMarker = 'still-alive';
    });

    const aboutLink = page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'About', exact: true });
    await expect(aboutLink).toBeVisible();

    const tagName = await aboutLink.evaluate((el) => el.tagName);
    const hasNextDataAttr = await aboutLink.evaluate((el) => el.hasAttribute('data-nextjs-prefetch') || !!(el as any).onclick);

    await Promise.all([
      page.waitForURL('**/about'),
      aboutLink.click(),
    ]);

    const markerSurvived = await page.evaluate(() => (window as any).__navMarker === 'still-alive').catch(() => false);

    console.log(`Nav link tagName=${tagName}, marker survived client nav=${markerSurvived}`);

    // Document this clearly in the report regardless of pass/fail:
    if (!markerSurvived) {
      console.log('FINDING: Primary navigation causes a FULL PAGE RELOAD (plain <a> tag, not next/link).');
    }
  });
});
