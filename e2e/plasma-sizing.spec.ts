import { test, expect } from '@playwright/test';
import { clickNav } from './helpers';

/**
 * The Plasma hero canvas's container (`.plasma-container`) used
 * `position: relative; height: 100%`, sitting as a normal-flow sibling
 * inside a <section> whose only height comes from `min-height: 100vh`
 * (Tailwind's `min-h-screen`). A percentage height inside a parent whose
 * height comes from `min-height` (rather than an explicit height) doesn't
 * reliably resolve per the CSS spec, so the container (and the <canvas>
 * inside it, which also gets `style.height = '100%'`) fell back to being
 * sized by the canvas's own intrinsic width/height *attributes* — which are
 * set imperatively by the WebGL renderer based on a `getBoundingClientRect()`
 * measurement of that same, incorrectly-sized container. That measurement
 * mismatch (confirmed: the canvas rendered several dozen px short of the
 * hero's actual height) is the kind of self-referential sizing bug that can
 * compound into runaway growth after repeated remounts (navigating away and
 * back). The fix makes `.plasma-container` `position: absolute; inset: 0`,
 * which resolves against the positioned ancestor's actual used height
 * directly, with no dependency on the canvas's own measured/attribute size.
 */
test('hero canvas fills the hero section exactly, and stays stable across navigation cycles', async ({ page }) => {
  const measure = () =>
    page.evaluate(() => {
      const hero = document.querySelector('section');
      const canvas = document.querySelector('.plasma-container canvas') as HTMLCanvasElement | null;
      return {
        heroHeight: hero?.getBoundingClientRect().height ?? null,
        canvasCssHeight: canvas?.clientHeight ?? null,
        docHeight: document.documentElement.scrollHeight,
      };
    });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const first = await measure();
  expect(first.heroHeight).not.toBeNull();
  // The canvas must fill the hero's full height (within a couple px of
  // rounding), not fall short of it.
  expect(Math.abs((first.canvasCssHeight ?? 0) - (first.heroHeight ?? 0))).toBeLessThanOrEqual(2);

  const clickNavLink = async (name: 'Home' | 'Work' | 'About' | 'Contact') => {
    await clickNav(page, name);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
  };

  const samples = [first];
  for (let i = 0; i < 4; i++) {
    await clickNavLink('About');
    await clickNavLink('Work');
    await clickNavLink('Contact');
    await clickNavLink('Home');
    await page.waitForTimeout(400);
    samples.push(await measure());
  }

  console.log('plasma sizing samples across nav cycles:', samples);

  for (const s of samples) {
    expect(Math.abs((s.canvasCssHeight ?? 0) - (s.heroHeight ?? 0))).toBeLessThanOrEqual(2);
  }

  // No growth trend across repeated mount/unmount cycles.
  const heroHeights = samples.map((s) => s.heroHeight ?? 0);
  const docHeights = samples.map((s) => s.docHeight);
  expect(Math.max(...heroHeights) - Math.min(...heroHeights)).toBeLessThanOrEqual(2);
  expect(Math.max(...docHeights) - Math.min(...docHeights)).toBeLessThanOrEqual(2);
});

/**
 * Regression coverage for: "plasma animation disappears on page re-entry
 * without refresh; only available on page refresh."
 *
 * Root causes fixed:
 *  1. `setSize`/`handleMouseMove` dereferenced `containerRef.current!`
 *     (non-null assertion). React nulls a ref's `.current` synchronously
 *     during unmount, *before* this component's passive-effect cleanup
 *     runs, so a ResizeObserver notification or mousemove event already
 *     queued for the outgoing instance could still fire in that window and
 *     throw `Cannot read properties of null (reading 'getBoundingClientRect')`
 *     uncaught.
 *  2. The WebGL context was never explicitly released on unmount, so
 *     repeated client-side mount/unmount cycles could leave several
 *     contexts alive-but-orphaned at once. Browsers cap concurrent WebGL
 *     contexts per page (Chromium: 16); once hit, the browser silently
 *     force-loses a context to enforce the cap, and draw calls on a lost
 *     context are silent no-ops - the canvas just renders nothing.
 */
test('plasma keeps rendering (no uncaught errors, no context loss) across repeated client-side re-entries', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const clickNavLink = async (name: 'Home' | 'Work' | 'About' | 'Contact') => {
    await clickNav(page, name);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
  };

  // Cycle away and back several times - each remount is a fresh chance to
  // hit the unmount-time race / context accumulation described above.
  for (let i = 0; i < 6; i++) {
    await clickNavLink('About');
    await clickNavLink('Home');
  }
  await page.waitForTimeout(500);

  expect(pageErrors, `Uncaught page errors: ${pageErrors.join('\n')}`).toEqual([]);

  const state = await page.evaluate(() => {
    const canvas = document.querySelector('.plasma-container canvas') as HTMLCanvasElement | null;
    const gl = canvas?.getContext('webgl2');
    return {
      canvasExists: !!canvas,
      contextLost: gl ? gl.isContextLost() : null,
    };
  });
  expect(state.canvasExists).toBe(true);
  expect(state.contextLost).toBe(false);

  // Sample pixel colors from an actual rasterized screenshot rather than
  // reading the live WebGL canvas directly: browsers clear a WebGL
  // context's backbuffer right after compositing unless
  // `preserveDrawingBuffer` is set, so a `drawImage()`-based readback of the
  // canvas element is racy/unreliable as a test signal and isn't what a
  // real user actually sees. A screenshot captures the composited pixels
  // instead, which is the ground truth for "does it look blank."
  const samplePlasmaVisible = async () => {
    // Crop to a small region where the plasma blob is reliably present
    // (left/center of the hero, avoiding text/logo/nav overlays) so the
    // resulting base64 payload is small enough to pass through
    // `page.evaluate`'s argument serialization reliably.
    const screenshotBuffer = await page.screenshot({
      clip: { x: 150, y: 80, width: 350, height: 200 },
    });
    const screenshotB64 = screenshotBuffer.toString('base64');
    return page.evaluate(async ({ b64 }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, img.width, img.height);
      // A "disappeared" plasma leaves this region flat white (the page
      // background). A rendered plasma has visible purple/gray tint, i.e.
      // meaningfully non-white pixels.
      let nonWhitePixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (255 - r > 15 || 255 - g > 15 || 255 - b > 15) nonWhitePixels++;
      }
      return nonWhitePixels > data.length / 4 / 20; // >5% of sampled pixels
    }, { b64: screenshotB64 });
  };

  expect(await samplePlasmaVisible()).toBe(true);
});
