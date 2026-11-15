import { test, expect } from '@playwright/test';
import { installInstrumentation } from './instrument';

/**
 * Measures the real cost of the OGL Plasma shader on the home hero:
 *  - frame-to-frame timing of its own rAF loop (is it running unthrottled at full speed
 *    even when the tab/section is not visible / off-screen?)
 *  - long-task count while the page is otherwise idle (a proxy for main-thread CPU pressure)
 *  - device-pixel-ratio & canvas backing-store size actually rendered
 */
test.describe('Plasma / OGL shader CPU cost', () => {
  test('captures long tasks and frame cadence while idle on the hero', async ({ page }) => {
    await page.addInitScript(installInstrumentation);

    await page.goto('/', { waitUntil: 'networkidle' });
    // Let hydration/initial-load related long tasks settle before we start
    // measuring, so the numbers below reflect steady-state idle cost only
    // (not page-load/hydration cost).
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      (window as any).__longTasks = [];
      // @ts-ignore
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__longTasks.push({ name: entry.name, duration: entry.duration, start: entry.startTime });
        }
      });
      try {
        po.observe({ type: 'longtask', buffered: false });
      } catch {
        // longtask not supported
      }
    });

    // Let the shader run "idle" (no interaction) for a fixed window and measure cost.
    const IDLE_MS = 5000;
    await page.waitForTimeout(IDLE_MS);

    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('.plasma-container canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      return {
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        dpr: window.devicePixelRatio,
      };
    });
    console.log('Plasma canvas info:', canvasInfo);
    expect(canvasInfo, 'Plasma canvas should be present on home hero').not.toBeNull();

    const longTasks = await page.evaluate(() => (window as any).__longTasks ?? []);
    const totalLongTaskMs = longTasks.reduce((sum: number, t: any) => sum + t.duration, 0);
    console.log(`Long tasks during ${IDLE_MS}ms idle on home hero: count=${longTasks.length}, totalBlockingMs=${totalLongTaskMs.toFixed(1)}`);

    // Measure actual rAF cadence of the page (should be close to display refresh, e.g. ~16.6ms @60Hz).
    const frameTimes: number[] = await page.evaluate(() => {
      return new Promise<number[]>((resolve) => {
        const times: number[] = [];
        let last = performance.now();
        let count = 0;
        function tick(t: number) {
          times.push(t - last);
          last = t;
          count++;
          if (count < 60) requestAnimationFrame(tick);
          else resolve(times);
        }
        requestAnimationFrame(tick);
      });
    });
    const avgFrame = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrame = Math.max(...frameTimes);
    console.log(`Avg frame time: ${avgFrame.toFixed(2)}ms, max frame time: ${maxFrame.toFixed(2)}ms (over ${frameTimes.length} frames)`);

    // Scroll away so the hero (and its canvas) is fully off-screen, then check whether the
    // shader loop keeps rendering at full tilt even though nothing is visible.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const rafBeforeOffscreen = await page.evaluate(() => (window as any).__rafTotalScheduled ?? 0);
    await page.waitForTimeout(2000);
    const rafAfterOffscreen = await page.evaluate(() => (window as any).__rafTotalScheduled ?? 0);
    const framesWhileOffscreen = rafAfterOffscreen - rafBeforeOffscreen;
    console.log(`rAF callbacks scheduled while hero scrolled off-screen (2s window): ${framesWhileOffscreen}`);
    // This count now reflects the *other* always-on rAF loops on the page (Lenis, GSAP's
    // ticker, ScrollTrigger, TargetCursor), since Plasma pauses itself via IntersectionObserver
    // + visibilitychange once its canvas is no longer visible.

    // This assertion documents current behavior rather than a hard pass/fail gate; long tasks
    // during idle scrub time on a marketing hero should ideally be zero.
    expect(totalLongTaskMs, 'unexpected long-task main-thread blocking while idle on hero').toBeLessThan(500);
  });
});
