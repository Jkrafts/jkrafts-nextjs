import { test, expect } from '@playwright/test';
import { installInstrumentation } from './instrument';
import { forceGC, getHeapSize, snapshotInstrumentation } from './helpers';

test.describe('Memory & resource leak detection across SPA navigation', () => {
  test('GL contexts, rAF loops, listeners and heap growth over repeated navigation', async ({ page }) => {
    await page.addInitScript(installInstrumentation);

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const NAV_CYCLES = 6;
    const heapSamples: (number | null)[] = [];
    const snapshots: Awaited<ReturnType<typeof snapshotInstrumentation>>[] = [];

    for (let i = 0; i < NAV_CYCLES; i++) {
      await page.goto('/about', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.goto('/projects', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.goto('/contact', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      await forceGC(page);
      await page.waitForTimeout(200);

      heapSamples.push(await getHeapSize(page));
      snapshots.push(await snapshotInstrumentation(page));
    }

    console.log('\n--- Heap size samples (bytes) after each full nav cycle ---');
    heapSamples.forEach((h, i) => console.log(`cycle ${i + 1}: ${h ? (h / 1024 / 1024).toFixed(2) + ' MB' : 'n/a'}`));

    console.log('\n--- Instrumentation snapshots (on "/") after each cycle ---');
    snapshots.forEach((s, i) => console.log(`cycle ${i + 1}:`, JSON.stringify(s)));

    // 1) On the home page there should only ever be ONE live canvas (the Plasma shader).
    const lastSnapshot = snapshots[snapshots.length - 1];
    expect(lastSnapshot.canvasCount, 'canvas elements left on "/" after repeated navigation').toBeLessThanOrEqual(1);

    // 2) Active requestAnimationFrame loops should stay bounded (Plasma + Lenis/ScrollTrigger RAF + TargetCursor spin ~ a handful),
    // not grow unbounded with each navigation (which would indicate leaked rAF loops from unmounted components).
    const rafActiveValues = snapshots.map((s) => s.rafActive ?? 0);
    const rafGrowth = rafActiveValues[rafActiveValues.length - 1] - rafActiveValues[0];
    console.log('rAF active growth across cycles:', rafActiveValues, 'growth =', rafGrowth);
    expect(rafGrowth, 'active rAF loop count grew across navigation cycles (leak)').toBeLessThanOrEqual(2);

    // 3) GL contexts should not accumulate beyond a handful (one per Plasma mount is expected since
    // OGL creates a new context each mount; browsers only allow a limited number of live WebGL contexts).
    const finalGlContexts = snapshots[snapshots.length - 1].glContextsCreated ?? 0;
    console.log('Total GL contexts created over test run:', finalGlContexts);
    expect(finalGlContexts, 'WebGL contexts created (should be ~1 per Home visit, GC­d in between)').toBeLessThan(NAV_CYCLES * 2 + 2);

    // 4) Heap should not grow unbounded (rough leak signal). Allow generous slack for JIT warmup/caches,
    // but flag clearly-monotonic large growth.
    const validHeap = heapSamples.filter((h): h is number => h !== null);
    if (validHeap.length >= 3) {
      const first = validHeap[0];
      const last = validHeap[validHeap.length - 1];
      const growthMB = (last - first) / 1024 / 1024;
      console.log(`Heap growth from cycle 1 to ${validHeap.length}: ${growthMB.toFixed(2)} MB`);
      expect(growthMB, 'JS heap grew significantly across repeated navigation (possible leak)').toBeLessThan(25);
    }
  });

  test('leaving the home page mid-animation does not leave a dangling Plasma canvas', async ({ page }) => {
    await page.addInitScript(installInstrumentation);
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300); // navigate away while Plasma's RAF loop is mid-flight
    await page.goto('/about', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const canvasCountOnAbout = await page.evaluate(() => document.querySelectorAll('canvas').length);
    expect(canvasCountOnAbout, 'canvas left over on /about after navigating away from home mid-animation').toBe(0);
  });
});
