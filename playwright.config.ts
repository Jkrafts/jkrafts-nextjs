import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    // Start with analytics refused, so the cookie banner (and Google's
    // scripts) stay out of the way; e2e/consent.spec.ts covers the banner.
    storageState: {
      cookies: [],
      origins: [{ origin: 'http://127.0.0.1:3100', localStorage: [{ name: 'jk-consent', value: 'denied' }] }],
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--enable-precise-memory-info',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Always test a fresh production build, never a stale one.
    command: 'npm run build && npm run start -- -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    // The contact function forwards to this; e2e/contact-function.spec.ts
    // stands up a fake Laravel API there.
    env: { LARAVEL_API_URL: 'http://127.0.0.1:3199/api' },
    timeout: 240_000,
  },
});
