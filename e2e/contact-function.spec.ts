import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';

/**
 * The contact form's backend: the route handler in app/api/contact/route.ts
 * (a Netlify Function in production). A fake JKrafts backend on :3199
 * (CONTACT_API_URL / CONTACT_API_KEY in playwright.config.ts) records what
 * the function forwards and answers however each test needs.
 */

let backend: Server;
let received: { url?: string; headers: Record<string, unknown>; body: unknown }[] = [];
let reply: { status: number; body: unknown } = { status: 201, body: { data: { id: 1 } } };

test.beforeAll(async () => {
  backend = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      received.push({ url: req.url, headers: req.headers, body: raw ? JSON.parse(raw) : null });
      res.writeHead(reply.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise<void>((resolve) => backend.listen(3199, '127.0.0.1', resolve));
});

test.afterAll(() => new Promise<void>((resolve) => backend.close(() => resolve())));

test.beforeEach(() => {
  received = [];
  reply = { status: 201, body: { data: { id: 1 } } };
});

const valid = { name: 'Ada', email: 'ada@example.com', subject: 'New website', message: 'Hello there.' };

test('the form submits through the function to the backend contract', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'networkidle' });
  const form = page.locator('#contact-form');
  await form.getByLabel('Name').fill(valid.name);
  await form.getByLabel('Email').fill(valid.email);
  await form.getByLabel('Subject').fill(valid.subject);
  await form.getByLabel('Message').fill(valid.message);
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('Message sent');

  expect(received).toHaveLength(1);
  expect(received[0].url).toBe('/api/v1/contact-submissions');
  expect(received[0].headers['x-api-key']).toBe('e2e-contact-key');
  expect(received[0].headers['authorization']).toBeUndefined();
  expect(String(received[0].headers['x-client-user-agent'])).toContain('Mozilla');
  // The four fields plus the page it came from; empty optional fields and
  // the honeypot are never forwarded.
  expect(received[0].body).toEqual({ ...valid, source_page: '/contact' });
});

test('optional fields are forwarded, with the phone normalized and the visitor address', async ({ request }) => {
  const res = await request.post('/api/contact', {
    data: { ...valid, company: 'Mwangi Tours', phone: '+254 712 345-678', service_interest: 'Web application', budget_range: 'KSh 100k–300k' },
    headers: { 'x-forwarded-for': '41.90.12.34, 10.0.0.1' },
  });
  expect(res.status()).toBe(200);
  expect(received).toHaveLength(1);
  expect(received[0].headers['x-client-ip']).toBe('41.90.12.34');
  expect(received[0].body).toEqual({
    ...valid,
    company: 'Mwangi Tours',
    phone: '+254712345678',
    service_interest: 'Web application',
    budget_range: 'KSh 100k–300k',
  });
});

test('invalid optional values are rejected before reaching the backend', async ({ request }) => {
  const res = await request.post('/api/contact', {
    data: { ...valid, phone: '0712345678', service_interest: 'Hacking', budget_range: 'Millions' },
  });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(Object.keys(body.errors).sort()).toEqual(['budget_range', 'phone', 'service_interest']);
  expect(received).toHaveLength(0);
});

test('validates on the server and passes backend validation errors back to their fields', async ({ page, request }) => {
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

test('the phone field explains the expected format', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'networkidle' });
  const form = page.locator('#contact-form');
  await form.getByLabel('Name').fill(valid.name);
  await form.getByLabel('Email').fill(valid.email);
  await form.getByLabel('Phone').fill('0712345678');
  await form.getByLabel('Subject').fill(valid.subject);
  await form.getByLabel('Message').fill(valid.message);
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form.getByLabel('Phone')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('.field-error')).toContainText('country code');
  expect(received).toHaveLength(0);
});

test('bots filling the honeypot get a quiet success and nothing is sent', async ({ request }) => {
  const res = await request.post('/api/contact', { data: { ...valid, website_url: 'https://spam.example' } });
  expect(res.status()).toBe(200);
  expect(received).toHaveLength(0);
});

test('upstream failures are generic, never leaked', async ({ request }) => {
  reply = { status: 500, body: { message: 'SQLSTATE[HY000] secret stack trace' } };
  const res = await request.post('/api/contact', { data: valid });
  expect(res.status()).toBe(502);
  expect(JSON.stringify(await res.json())).not.toContain('SQLSTATE');

  reply = { status: 401, body: { message: 'Unauthenticated.' } };
  const rejected = await request.post('/api/contact', { data: valid });
  expect(rejected.status()).toBe(502);
});

test('rejects other methods and other origins', async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405);
  const foreign = await request.post('/api/contact', { data: valid, headers: { Origin: 'https://evil.example' } });
  expect(foreign.status()).toBe(403);
  expect(received).toHaveLength(0);
});
