import { Page } from '@playwright/test';

export const PAGES = ['/', '/about', '/projects', '/contact'];

export function collectConsole(page: Page) {
  const messages: { type: string; text: string; location?: string }[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      messages.push({ type: msg.type(), text: msg.text(), location: msg.location()?.url });
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  return { messages, pageErrors };
}

export async function getHeapSize(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const perf = performance as any;
    if (perf.memory && typeof perf.memory.usedJSHeapSize === 'number') {
      return perf.memory.usedJSHeapSize as number;
    }
    return null;
  });
}

export async function forceGC(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');
  await client.detach();
}

export interface InstrumentationSnapshot {
  rafActive: number | null;
  rafTotalScheduled: number | null;
  glContextsCreated: number | null;
  activeIntervalCount: number | null;
  listenerCount: number | null;
  canvasCount: number;
}

export async function snapshotInstrumentation(page: Page): Promise<InstrumentationSnapshot> {
  return page.evaluate(() => {
    const w = window as any;
    return {
      rafActive: w.__rafActive ?? null,
      rafTotalScheduled: w.__rafTotalScheduled ?? null,
      glContextsCreated: w.__glContextsCreated ?? null,
      activeIntervalCount: w.__activeIntervalCount ?? null,
      listenerCount: w.__listenerCount ?? null,
      canvasCount: document.querySelectorAll('canvas').length,
    };
  });
}

/**
 * Navigate with the primary (desktop) navigation. "Home" uses the logo.
 * Uses next/link, so this is a client-side transition.
 */
export async function clickNav(page: Page, label: 'Home' | 'Work' | 'About' | 'Contact') {
  const link =
    label === 'Home'
      ? page.getByRole('link', { name: 'Jkrafts home' })
      : page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label, exact: true });
  await link.click();
  // Let the page transition finish (lib/pageTransition.ts), as a visitor
  // would see it, before the next step.
  await page.waitForFunction(() => !document.querySelector('.page-transition'), null, { timeout: 5000 });
}
