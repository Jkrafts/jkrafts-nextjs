import { test, expect } from '@playwright/test';

/**
 * Theme switching. Icons are inline SVG using currentColor, so they follow
 * the theme through CSS with no per-theme image URLs; this previously caused
 * the contact icons to stick on the light variant after a reload in dark
 * mode, along with a hydration mismatch warning.
 */
test('dark theme persists across reloads without hydration warnings', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /toggle theme/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.goto('/contact', { waitUntil: 'networkidle' });
  errors.length = 0;
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveClass(/dark/);

  // The email channel icon is drawn in the theme's text colour.
  const colors = await page.evaluate(() => {
    const link = document.querySelector('a[href^="mailto:"] svg');
    return {
      icon: link ? getComputedStyle(link).color : null,
      bg: getComputedStyle(document.body).backgroundColor,
    };
  });
  expect(colors.icon).not.toBeNull();
  expect(colors.icon).not.toBe(colors.bg);
  expect(errors.join('\n')).not.toMatch(/hydrat/i);
});
