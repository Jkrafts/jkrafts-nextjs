import { test, expect } from '@playwright/test';

/**
 * Cookie consent (lib/consent.ts, components/CookieBanner.tsx,
 * components/Analytics.tsx): nothing from Google loads until analytics is
 * allowed, refusing is as easy as allowing, and the choice can be changed.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const googleRequests = (page: import('@playwright/test').Page) => {
  const urls: string[] = [];
  page.on('request', (r) => {
    if (/googletagmanager\.com|google-analytics\.com/.test(r.url())) urls.push(r.url());
  });
  return urls;
};

test('first visit: banner shown, nothing from Google loads', async ({ page }) => {
  const google = googleRequests(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  const banner = page.getByRole('region', { name: 'Analytics cookies' });
  await expect(banner).toBeVisible();
  // Equal choices, side by side.
  const [refuse, allow] = [banner.getByRole('button', { name: 'Refuse' }), banner.getByRole('button', { name: 'Allow' })];
  const [a, b] = [(await refuse.boundingBox())!, (await allow.boundingBox())!];
  expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  expect(await refuse.getAttribute('class')).toBe(await allow.getAttribute('class'));
  expect(google).toEqual([]);
  expect((await page.context().cookies()).filter((c) => c.name.startsWith('_ga'))).toEqual([]);
});

test('refusing hides the banner for good and loads nothing', async ({ page }) => {
  const google = googleRequests(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Refuse' }).click();
  await expect(page.getByRole('region', { name: 'Analytics cookies' })).toHaveCount(0);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('region', { name: 'Analytics cookies' })).toHaveCount(0);
  expect(google).toEqual([]);
});

test('allowing loads analytics; Cookie settings reopens the choice', async ({ page }) => {
  // Don't contact Google from tests: answer its script requests locally.
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const google = googleRequests(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Allow' }).click();
  await expect(page.getByRole('region', { name: 'Analytics cookies' })).toHaveCount(0);
  await expect.poll(() => google.length).toBeGreaterThan(0);

  await page.getByRole('contentinfo').getByRole('button', { name: 'Cookie settings' }).click();
  const banner = page.getByRole('region', { name: 'Analytics cookies' });
  await expect(banner).toBeFocused();
  await expect(banner).toContainText('Currently: analytics allowed');
});

test('legal pages render with their contents list and no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('jk-consent', 'denied'));
  for (const [path, title] of [
    ['/privacy', 'Privacy policy'],
    ['/cookies', 'Cookie policy'],
    ['/terms', 'Terms of service'],
    ['/security', 'Security'],
    ['/licenses', 'Licences'],
  ]) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Privacy' })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
