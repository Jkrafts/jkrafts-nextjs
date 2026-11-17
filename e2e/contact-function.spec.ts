import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';

/**
 * The contact form's backend: the route handler in app/api/contact/route.ts
 * (a Netlify Function in production). A fake
 * Laravel API on :3199 (LARAVEL_API_URL in playwright.config.ts) records
 * what the function forwards and answers however each test needs.
 */

let laravel: Server;
let received: { url?: string; headers: Record<string, unknown>; body: unknown }[] = [];
let reply: { status: number; body: unknown } = { status: 200, body: { message: 'ok' } };

test.beforeAll(async () => {
  laravel = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      received.push({ url: req.url, headers: req.headers, body: raw ? JSON.parse(raw) : null });
      res.writeHead(reply.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise<void>((resolve) => laravel.listen(3199, '127.0.0.1', resolve));
});

test.afterAll(() => new Promise<void>((resolve) => laravel.close(() => resolve())));

test.beforeEach(() => {
  received = [];
  reply = { status: 200, body: { message: 'ok' } };
});

const valid = { name: 'Ada', email: 'ada@example.com', subject: 'New website', message: 'Hello there.' };

test('the form submits through the function to Laravel', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'networkidle' });
  const form = page.locator('#contact-form');
  await form.getByLabel('Name').fill(valid.name);
  await form.getByLabel('Email').fill(valid.email);
  await form.getByLabel('Subject').fill(valid.subject);
  await form.getByLabel('Message').fill(valid.message);
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('Message sent');

  expect(received).toHaveLength(1);
  expect(received[0].url).toBe('/api/contact');
  // Exactly the four fields: the honeypot is never forwarded.
  expect(received[0].body).toEqual(valid);
});

test('validates on the server and passes Laravel validation errors back to their fields', async ({ page, request }) => {
  const bad = await request.post('/api/contact', { data: { ...valid, email: 'not-an-email', message: '' } });
  expect(bad.status()).toBe(422);
  const body = await bad.json();
  expect(Object.keys(body.errors).sort()).toEqual(['email', 'message']);
  expect(received).toHaveLength(0);

  reply = { status: 422, body: { message: 'The email domain is not accepted.', errors: { email: ['The email domain is not accepted.'] } } };
  await page.goto('/contact', { waitUntil: 'networkidle' });
  const form = page.locator('#contact-form');
  await form.getByLabel('Name').fill(valid.name);
  await form.getByLabel('Email').fill(valid.email);
  await form.getByLabel('Subject').fill(valid.subject);
  await form.getByLabel('Message').fill(valid.message);
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByLabel('Email')).toBeFocused();
  await expect(form.locator('.field-error')).toHaveText('The email domain is not accepted.');
});

test('bots filling the honeypot get a quiet success and nothing is sent', async ({ request }) => {
  const res = await request.post('/api/contact', { data: { ...valid, company: 'Spam Inc' } });
  expect(res.status()).toBe(200);
  expect(received).toHaveLength(0);
});

test('upstream failures are generic, never leaked', async ({ request }) => {
  reply = { status: 500, body: { message: 'SQLSTATE[HY000] secret stack trace' } };
  const res = await request.post('/api/contact', { data: valid });
  expect(res.status()).toBe(502);
  expect(JSON.stringify(await res.json())).not.toContain('SQLSTATE');
});

test('rejects other methods and other origins', async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405);
  const foreign = await request.post('/api/contact', { data: valid, headers: { Origin: 'https://evil.example' } });
  expect(foreign.status()).toBe(403);
  expect(received).toHaveLength(0);
});
