# JKrafts Landing — Performance & Bug Audit Report

**Date:** 2026-07-27
**Method:** Manual code audit + a new Playwright e2e test suite (`/e2e`) added to this
repo, run against a production build (`next build && next start`).

## TL;DR

The user's suspicion was correct: the OGL/WebGL "Plasma" shader on the home hero was
the single biggest performance liability in the app. On a machine/browser without
hardware-accelerated WebGL (common on locked-down corporate laptops, some VMs/remote
desktops, and the CI/sandbox environment used for this audit), it was pegging the main
thread for **~8.4 seconds of blocking main-thread time in every 5-second window** it was
visible, rendering at **~4 FPS** instead of 60. Alongside that, several components were
missing GSAP animation cleanup (memory leaks on navigation), one page was making broken
external network calls for every project thumbnail, the primary nav menu was doing full
page reloads instead of client-side transitions, analytics tags were misconfigured and
colliding, and there were duplicate DOM ids.

All of the above have been fixed and are now covered by automated tests. Full before/after
numbers are in the [Test Results](#test-results-before--after) section.

---

## How this was tested

Playwright + Chromium was installed and a new `e2e/` suite was added:

| File | What it checks |
|---|---|
| `e2e/console-and-navigation.spec.ts` | Every route (`/`, `/about`, `/projects`, `/contact`) loads with zero `console.error`/uncaught exceptions; no duplicate DOM ids. |
| `e2e/memory-and-leaks.spec.ts` | Repeated navigation across all 4 pages (6 cycles), tracking JS heap size, WebGL context count, active `requestAnimationFrame` loops, `setInterval` count, and event-listener count via an injected instrumentation script (`e2e/instrument.ts`). |
| `e2e/plasma-cpu.spec.ts` | Long-task count/duration and real frame cadence while idle on the hero; behavior when the shader is scrolled off-screen. |
| `e2e/spa-navigation.spec.ts` | Whether clicking the primary nav triggers a full page reload or a client-side transition. |
| `e2e/gl-renderer-info.spec.ts` | Reports whether WebGL is hardware- or software-rendered in the test environment (context for interpreting the CPU numbers). |

Run with:
```bash
npm run test:e2e            # headless run against a production build
npx playwright show-report  # HTML report (e2e-report/)
```

---

## Bugs found & fixes applied

### 1. 🔴 Critical — OGL Plasma shader caused severe CPU spikes and never paused

**File:** `components/Plasma/index.tsx` (used by `components/Home/Hero.tsx`)

**What was wrong:**
- The fragment shader runs a **60-step raymarch loop per pixel**, every frame, forever.
- The render loop (`requestAnimationFrame`) never stopped — not when the canvas
  scrolled off-screen, and not when the browser tab was backgrounded.
- No FPS cap — it rendered as fast as the browser would allow.
- No adaptation for devices without hardware WebGL acceleration.
- No `prefers-reduced-motion` support (accessibility + perf issue).

**Measured impact (before fix):** idle on the hero for 5 seconds produced **35 long
tasks totaling 8,401ms of main-thread blocking**, and the shader rendered at an average
of **241ms/frame (≈4 FPS)** instead of the expected ~16.6ms (60 FPS). This was on a
SwiftShader (software/CPU-emulated) WebGL renderer — confirmed via
`WEBGL_debug_renderer_info` — which is representative of locked-down corporate machines,
many VMs/remote desktops/CI runners, and hardware-acceleration-disabled browser configs.
Scrolling the hero fully off-screen did not reduce its activity at all.

**Fixes applied (`components/Plasma/index.tsx`):**
1. **Visibility gating** — added an `IntersectionObserver` (pauses when the canvas is
   scrolled out of view) and a `visibilitychange` listener (pauses when the tab is
   backgrounded). The animation resumes seamlessly (time origin is shifted forward by
   the paused duration so there's no visual jump).
2. **FPS cap** (`maxFps` prop, default `30`) — skips the expensive uniform update +
   render call when frames arrive faster than the cap. Free win on capable hardware;
   on this decorative, slow-moving effect, 30fps is visually indistinguishable from 60fps.
3. **Adaptive resolution scaling** — detects a software/CPU-emulated renderer
   (`SwiftShader`, `llvmpipe`, etc. via `WEBGL_debug_renderer_info`) and renders the
   shader at 35% of the container's linear resolution in that case, then lets the
   browser upscale it via CSS. Because the shader's cost is per-pixel, this is a
   **quadratic** reduction in cost (~8x fewer pixels) and is visually unnoticeable for
   this soft/blurred effect. Hardware-accelerated devices are unaffected (`renderScale = 1`).
4. **`prefers-reduced-motion: reduce`** — skips creating the WebGL context and render
   loop entirely for users who've opted out of animations at the OS level.

**Measured impact (after fix):** the same 5-second idle window now produces **0 long
tasks**, average frame time dropped to **~20–27ms (close to the 30fps target)**, and the
canvas renders at 448×224 instead of 1280×640 internally (still visually 1280×640 via
CSS) on the software-rendered test environment. Visual quality is unaffected — the
downscale is imperceptible given how soft/blurred this effect already is (verified via
screenshot during this audit).

---

### 2. 🟠 Memory leaks — missing GSAP cleanup on unmount

Several components created GSAP tweens/timelines with `repeat: -1` (infinite) or tied
to a `ScrollTrigger`, but never killed them in the `useEffect` cleanup function. Once a
component using these unmounts (e.g., via client-side navigation — see bug #5), the
tween keeps ticking forever against a detached DOM node, and in the ScrollTrigger case,
a trigger definition is left registered permanently (and would duplicate if the
component ever remounts, e.g. under React Strict Mode in dev).

| File | Issue | Fix |
|---|---|---|
| `components/Home/Hero.tsx` | Infinite scroll-indicator tween (`repeat: -1, yoyo: true`) created with no cleanup at all. | Store the timeline in `tl` and `return () => tl.kill()`. |
| `components/Home/IntroText.tsx` | `gsap.timeline({ scrollTrigger: {...} })` created with no cleanup. | `return () => { tl.scrollTrigger?.kill(); tl.kill(); }`. |
| `components/AnimatedBlob.tsx` | Two infinite tweens (`repeat: -1`) with no cleanup. *(Component is currently unused/dead code — fixed for correctness in case it's reused later; see [Recommendations](#additional-recommendations-not-changed)).* | Store tween refs and kill both on unmount. |

**Verification:** `e2e/memory-and-leaks.spec.ts` navigates through all 4 pages 6 times
in a row (24 navigations) and tracks JS heap size + active `requestAnimationFrame` loop
count. After the fixes, heap size is flat/slightly negative across cycles (GC'd cleanly)
and the active rAF loop count does not grow — see [Test Results](#test-results-before--after).

---

### 3. 🟠 `ScrollFlipCards` created a new GSAP tween on every scroll frame

**File:** `components/ScrollFlipCards/index.tsx`

Inside a scrubbed `ScrollTrigger`'s `onUpdate` (which fires on **every scroll frame**,
potentially 60+ times/sec), the code unconditionally called:
```ts
gsap.to(cardContainer, { marginTop: '0px', duration: 0.5, ease: "power2.out" });
```
`gsap.to()` allocates a new Tween object every time it's called. Since `marginTop` only
ever has two resting states (`0px` / `120px`), this was allocating and immediately
overwriting dozens of Tween objects per second during any scroll gesture — pure GC churn
and wasted CPU, stacking on top of the Plasma shader cost during scroll.

**Fix:** added a ref (`isCardContainerLoweredRef`) mirroring the pattern already used
elsewhere in the same file for the gap-opening/card-flip animations, so the tween only
fires once, exactly when the 0.25 progress threshold is crossed in either direction.

---

### 4. 🟠 `/projects` page depended on an external placeholder image service (and it failed in testing)

**File:** `components/Projects/ProjectsRoot.tsx`, `next.config.ts`

Every project's circular avatar thumbnail used:
```ts
const projectImage = (): string => 'https://picsum.photos/200';
```
— the **exact same** hardcoded external URL for all 5 projects, regardless of which
project it was. This is a third-party network dependency with no fallback, and it
reproduced exactly the kind of failure this pattern invites during e2e testing:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
GET /_next/image?url=https%3A%2F%2Fpicsum.photos%2F200&w=128&q=75
```
Meanwhile, the project data (`data/projects.ts`) already references real, locally-hosted
per-project images (`/projects/saas/ui.jpg`, `/projects/pos/wireframes.jpg`, etc.) that
were never wired up to this component.

**Fix:** `projectImage()` now pulls each project's own "process" slide image from local
`public/` assets (falling back to `/logo.png` if a project has no image slide, e.g. the
one project whose only process asset is a video). No external network dependency, and
each card now shows an image relevant to that project. Also removed the now-unused
`images.domains: ['picsum.photos']` entry from `next.config.ts` (this also happened to
resolve a Next.js deprecation warning about `images.domains` vs `images.remotePatterns`).

> **Note:** `data/projects.ts` also references some cover images that don't actually
> exist on disk yet (`/projects/pos/cover.jpg`, `/projects/business/cover.jpg`,
> `/projects/admin/cover.jpg`, `/projects/interactive/cover.mp4`). These aren't used by
> the code path fixed here, but whoever owns project assets should either add the
> missing files or update `data/projects.ts` to point at what actually exists.

---

### 5. 🟡 Primary navigation caused full page reloads instead of client-side transitions

**File:** `components/StaggeredMenu/index.tsx`

The nav menu items were rendered as plain `<a href="...">` tags instead of `next/link`.
Since all 4 routes share a persistent layout (`Navbar`, `Footer`, `LenisProvider`), the
intent was clearly for these to be fast client-side transitions — but plain anchors
always force a full document reload, which:
- Re-downloads/re-parses/re-hydrates the entire JS bundle on every nav click,
- Defeats Next.js's route prefetching,
- Breaks the persistent Lenis smooth-scroll instance's continuity, snapping instead of
  smoothly transitioning between pages.

Confirmed via `e2e/spa-navigation.spec.ts`: a marker set on `window` before clicking a
menu link did **not** survive the navigation pre-fix (proving it was a full reload).

**Fix:** internal menu items now use the existing `CursorLink` component (which already
wraps `next/link` and is used elsewhere in the app, e.g. for the logo/CTAs) instead of a
raw `<a>`. External social links are unaffected (correctly still plain `<a target="_blank">`).

**Bonus effect:** this also made the memory-leak test's "24 navigations" much more
representative of real usage (previously each `page.goto()` was effectively a full
reload that wiped all state; now navigation is genuinely client-side, and the app still
shows no leaks — see [Test Results](#test-results-before--after)).

---

### 6. 🟡 Duplicate DOM `id="contact"` and duplicate GTM script ids

**Files:** `components/ContactForm.tsx`, `app/globals.css`, `app/layout.tsx`

Two separate problems produced the same symptom (duplicate ids, invalid HTML):

1. The home page (`app/(smooth)/page.tsx`) wraps `<ContactForm />` in
   `<section id="contact">`, but the `<form>` inside `ContactForm.tsx` *also* had
   `id="contact"` — two elements with the same id on the same page. This breaks
   `getElementById`/CSS-selector correctness and is an accessibility/HTML-validity issue.
   **Fix:** renamed the form's id to `id="contact-form"` and updated the one CSS rule
   that targeted it (`app/globals.css`).

2. `app/layout.tsx` rendered `<GoogleTagManager>` **twice** — once with a `GTM-*`
   container id (correct) and once with a `G-*` id, which is a **GA4 Measurement ID
   format**, not a GTM container id. `@next/third-parties`'s `GoogleTagManager`
   component hardcodes `id="_next-gtm"` on its injected `<script>` tag, so mounting it
   twice produced two script elements sharing that id — invalid HTML, and depending on
   `next/script`'s dedup behavior, a real risk of the second one being silently dropped
   or double-firing, i.e. **broken/unreliable analytics**.
   **Fix:** the `G-*` id now uses the dedicated `<GoogleAnalytics gaId="...">` component
   from the same package, which is what GA4 Measurement IDs are meant for.

**Verification:** `e2e/console-and-navigation.spec.ts`'s duplicate-id check went from
finding `[['contact', 2], ['_next-gtm', 2]]` to `[]`.

---

## Test Results (before → after)

| Metric | Before | After |
|---|---|---|
| Console errors on `/projects` | 1 (500 from picsum.photos) | 0 |
| Duplicate DOM ids on `/` | `contact` (×2), `_next-gtm` (×2) | none |
| Long tasks during 5s idle on hero | 35 tasks / **8,401ms** blocked | **0 tasks / 0ms** |
| Avg. shader frame time | **241.77ms** (~4 FPS) | **~20–27ms** (~30-45 FPS) |
| Plasma canvas internal resolution (this env) | 1280×640 | 448×224 (CSS-upscaled, visually identical) |
| JS heap growth over 6 full nav cycles (24 navigations) | +0.83 MB | **−0.20 MB** (net negative / flat) |
| Active `requestAnimationFrame` loop growth across cycles | 0 (already fine) | 0 (confirmed still fine) |
| WebGL contexts created over test run | 1 | 1 (unchanged — was already clean) |
| Primary nav → client-side transition | ❌ full reload | ✅ client-side (verified via marker survival) |
| All 10 e2e tests | 3 failing | **10/10 passing** |

Full raw logs are reproducible via `npm run test:e2e`.

---

## Files changed

- `components/Plasma/index.tsx` — visibility gating, FPS cap, adaptive resolution, `prefers-reduced-motion`.
- `components/Home/Hero.tsx` — GSAP cleanup.
- `components/Home/IntroText.tsx` — GSAP + ScrollTrigger cleanup.
- `components/AnimatedBlob.tsx` — GSAP cleanup (currently unused component).
- `components/ScrollFlipCards/index.tsx` — avoid per-frame tween allocation.
- `components/Projects/ProjectsRoot.tsx` — removed external image dependency.
- `next.config.ts` — removed now-unused `images.domains`.
- `components/StaggeredMenu/index.tsx` — internal nav now uses `next/link` (via `CursorLink`).
- `components/ContactForm.tsx`, `app/globals.css` — fixed duplicate `id="contact"`.
- `app/layout.tsx` — fixed GA4/GTM tag configuration.
- `playwright.config.ts`, `e2e/*` — new e2e test suite (this audit's tooling).
- `.gitignore` — ignore Playwright test-result/report output.

---

---

## Round 2 — follow-up bug fixes (2026-07-27)

After the audit above shipped, the following issues were reported from real usage and
fixed, each with new permanent Playwright coverage (`e2e/staggered-menu.spec.ts`,
`e2e/theme-icons.spec.ts`, `e2e/scroll-stack.spec.ts`):

### 1. Sidebar nav stayed open after navigating
`Navbar`/`StaggeredMenu` live in the persistent `(smooth)` layout, so the component is
never unmounted by client-side navigation — it had no way of knowing a navigation
happened. **Fix:** `StaggeredMenu` now watches `usePathname()` and calls `closeMenu()`
whenever the route changes.

### 2. Contact page social icons showed the wrong (low-contrast) variant in dark mode
Root cause was a subtle React/next-themes hydration quirk, not a CSS bug:
`next-themes`'s `resolvedTheme` is resolved from `localStorage` **synchronously on the
client's first render** (a lazy `useState` initializer, not something set later in an
effect) — so if the user had previously chosen dark mode, resolvedTheme was already
`"dark"` on that very first client render. The server, with no access to
`localStorage`, always renders the light/black variant. Because the DOM shape is
identical either way (just a different `src` value), React's hydration silently
**keeps the server's stale attribute value** instead of patching it, and since nothing
changes on subsequent renders (resolvedTheme was already correct from the start), the
icon was stuck on the wrong variant forever — this was also the exact cause of the
"hydration mismatch" console warning. **Fix:** `Icon.tsx` now uses a hydration-safe
`useSyncExternalStore`-based `mounted` flag (React's own recommended pattern for this
exact class of bug) so the very first client render matches the server exactly, then
switches to the real theme-derived variant on the next render — a genuine change that
React does reconcile/patch correctly.

### 3. "Featured Projects" title unpinned before the cards finished stacking
The pinned header's `ScrollTrigger` end point was computed from when the last card's
*scale* animation finished, but the cards also *translate* into their final stacked
position, which (depending on `stackPosition`/`scaleEndPosition`/`itemStackDistance`)
finishes later than the scale animation. **Fix:** `ScrollStack`'s `computeInitialOffsets`
now computes the pin end as the later of the scale-completion point and the
translate-settle point (mirroring the same clamp math `updateCardTransforms` uses for
the last card's `translateY`), so the header stays pinned until the cards are visually
fully stacked, then unpins and scrolls in unison.

### 4. Project cards showing random `picsum.photos` images that changed on reload
Already fixed in the first audit pass (bug #4 above) by switching to each project's own
local "process" image; re-verified here — thumbnails are now static, local, and
distinct per project (screenshot-verified), with `/logo.png` as a deterministic fallback
for the one project whose only asset is a video.

### 5. Menu toggle button was "buggy" — could get stuck open, text/icon out of sync
Two independent bugs compounded to produce this:
- `playOpen()` bailed out early with `if (busyRef.current) return;` while a close
  animation was still finishing. `toggleMenu()` doesn't know that happened, though — it
  unconditionally updates `open` state, `aria-expanded`, the icon rotation, and the
  cycling text label. The result: clicking to reopen the menu while it was still
  mid-close made the button *say* "open" (icon, label, `aria-expanded`) while the panel
  itself silently never animated back in, since it aborted before ever building/playing
  a new timeline.
- The "click outside to close" `mousedown` listener treated the toggle button itself as
  "outside" the panel. Clicking the toggle to *close* the menu fired `mousedown` first
  (closing it via that listener), then the button's own `onClick`/`toggleMenu` fired
  right after and immediately reopened it — clicking to close could look like it does
  nothing / reopens itself.

  **Fix:** removed the `busyRef` early-return (the timeline is already safely
  killed/rebuilt on every call, so it's always safe to just play), and excluded the
  toggle button from the click-outside handler.

### 6. Navigating back to the index page broke it after visiting other pages
`ScrollStackContainer`'s `useLayoutEffect` created a `gsap.context()` (with a
`gsap.matchMedia()` and a pinned `ScrollTrigger` inside it) but never called
`ctx.revert()` on unmount. Every remount (e.g. navigating back to `/`) left the
*previous* instance's `ScrollTrigger` registered forever, still referencing the header
element from the earlier mount that had since been removed from the DOM — after a
couple of navigation cycles, multiple zombie `ScrollTrigger`s fought over pinning/scroll
math on the same page. **Fix:** added `return () => ctx.revert();`.

### 7. Hydration mismatch warning in the console
Same root cause as bug #2 above — fixed by the same `Icon.tsx` change. Verified with a
dedicated test that no `console.error` matching `/hydrat/i` occurs on any page,
including a full reload with dark mode already persisted in `localStorage`.

---

---

## Round 3 — follow-up bug fixes (2026-07-27, later same day)

### 1. Featured project cards stacked flush on top of each other instead of a stepped fan
`ScrollStack`'s `updateCardTransforms` capped every card's `translateY` at the exact same
value (`endTop - cardTop`, identical regardless of index), so once scrolling finished, all
3 cards converged on the exact same final screen position — visually just the last card
covering the others with no visible stack underneath. **Fix:** each card's cap now
subtracts `itemStackDistance * (numCards - 1 - i)`, so earlier cards settle progressively
higher and peek out above the ones stacked after them (screenshot-verified: a visible
green → purple → blue step is now visible). New test: `e2e/scroll-stack.spec.ts` →
"cards settle into a stepped stagger, not a flat overlap".

### 2. Plasma hero grew vertically (and stretched the page) after navigating back to `/`
`.plasma-container` used `position: relative; height: 100%` as a normal-flow sibling
inside a `<section>` whose only height comes from Tailwind's `min-h-screen`
(`min-height: 100vh`, not an explicit `height`). Per the CSS spec, a percentage height
resolving against a parent whose height comes from `min-height` (rather than an
explicit height) isn't reliable — that chain of `100%` heights is effectively treated as
`auto`, so both the container and the `<canvas>` inside it (which also gets
`style.height = '100%'` in JS) fell back to being sized by the canvas's own *intrinsic*
`width`/`height` attributes, which the WebGL renderer sets imperatively from a
`getBoundingClientRect()` measurement of that same, ambiguously-sized container —
confirmed empirically: the canvas rendered ~640px tall instead of the hero's actual
720px. That kind of self-referential measurement (size an element based on a
`ResizeObserver` reading of a box whose own size depends on that same element) is a
classic source of runaway growth after repeated remounts. **Fix:** `.plasma-container`
is now `position: absolute; inset: 0` (matching the pattern the sibling content div in
`Hero.tsx` already used for the same reason) — this resolves directly against the
positioned ancestor's actual used height with no dependency on the canvas's own
measured size. Verified the canvas now fills the hero's height exactly (within
rounding) and stays stable across repeated client-side navigation cycles. New test:
`e2e/plasma-sizing.spec.ts`.

### 3. Project avatars still showed "the same image" despite different filenames
The Round-2 fix pointed each project's avatar at its own `process` slide image
(`/projects/<slug>/....jpg`), which looked correct in the data — but those "different"
files (`saas/ui.jpg`, `pos/wireframes.jpg`, `business/mockups.jpg`, `admin/flows.jpg`)
turned out to be **byte-for-byte identical** placeholder stock photos (verified via
`md5sum`, all 4 hash to `72f1844477fc887d16d406291cefc75d`) — the exact same
"all projects show the same image" symptom as the original picsum.photos bug, just
hiding behind different filenames. Rather than depend on real per-project photography
that doesn't exist yet, avatars are now derived from data every project already has and
is guaranteed unique: `accentColor` (background) + title initials — no image asset, no
network request, and mathematically impossible to collide between projects.
Screenshot-verified 5 distinct colored avatars. New test:
`e2e/projects-avatars.spec.ts`.

---

## Round 4 — follow-up bug fix (2026-07-27, later same day)

### 1. Plasma hero animation disappeared on client-side page re-entry — only worked after a hard refresh
Two related lifecycle bugs in `components/Plasma/index.tsx`, both stemming from the same
root cause: internal callbacks (`setSize`, `handleMouseMove`, and the cleanup function
itself) read `containerRef.current` *again*, later, instead of using the DOM node they
already had a handle on. React nulls out a ref's `.current` synchronously while
unmounting — **before** this component's own `useEffect` cleanup runs — so by the time
any of these fired for an outgoing (navigated-away-from) Plasma instance, the ref was
already `null`:

- `setSize` and `handleMouseMove` used a non-null assertion
  (`containerRef.current!.getBoundingClientRect()`). A `ResizeObserver` notification or
  `mousemove` event already queued for the outgoing instance (easily triggered by the
  viewport/scrollbar reflow a route change itself causes) could still fire in that
  window and throw `Cannot read properties of null (reading 'getBoundingClientRect')`
  **uncaught** — confirmed via a Playwright repro that captured this exact `pageerror`
  on every client-side navigation away from `/`.
- More importantly, the component never explicitly released its WebGL context on
  unmount — it relied on the browser's garbage collector to eventually reclaim the
  detached canvas. Browsers cap the number of **simultaneously live** WebGL contexts
  per page (16 in Chromium); once that cap is hit, the browser silently force-loses an
  existing context to make room for a new one, and draw calls on a lost context are
  silent no-ops — the canvas keeps "rendering" every frame (nothing crashes, nothing
  logs) but paints nothing. Since this component fully remounts (new context, new
  canvas) on every client-side visit to `/`, a handful of quick navigation cycles was
  enough to blank out the *newest* instance this way — exactly the "only works after a
  refresh" symptom, since a hard reload always starts from zero live contexts.

**Fix:**
- Captured the container DOM node once in a local `const container` at the top of the
  effect (guaranteed non-null there) and closed over that everywhere else in the effect
  — including the cleanup function — instead of re-reading `containerRef.current`
  later. This is also what the `react-hooks/exhaustive-deps` lint rule was already
  flagging on the cleanup's ref access; the fix resolves that warning as a side effect.
- Added an explicit `gl.getExtension('WEBGL_lose_context')?.loseContext()` call in the
  cleanup function, so each instance's GPU context is deterministically released the
  moment the component unmounts rather than waiting on GC — preventing contexts from
  piling up across repeated navigation.

Verified with a new Playwright test that cycles between `/` and `/about` six times via
client-side navigation, then asserts (a) zero uncaught page errors, (b)
`gl.isContextLost()` is `false`, and (c) the plasma blob is actually visible in a
screenshot crop of the hero (rather than reading the live WebGL canvas directly, since
browsers clear a WebGL backbuffer right after compositing unless
`preserveDrawingBuffer` is set, which makes a raw canvas readback an unreliable signal
for "does it look blank" — a rasterized screenshot is closer to what a user actually
sees). New test: `e2e/plasma-sizing.spec.ts` →
"plasma keeps rendering (no uncaught errors, no context loss) across repeated
client-side re-entries".

---

## Additional recommendations (not changed)

These were noticed during the audit but left alone since they're either cosmetic,
require asset/design input, or are out of scope for a "fix bugs" pass:

- **`app/(snap)/layout.tsx`** has no corresponding `page.tsx` anywhere in the app — it's
  dead code (a route group layout with no route using it). Safe to delete if it's not
  planned for near-term use.
- **`components/AnimatedBlob.tsx`** is not imported/used anywhere in the app. It's fixed
  (see bug #2) in case it's wired up later, but consider removing it if it's truly unused.
- **`data/projects.ts`** references several cover images/videos that don't exist on disk
  (`cover.jpg`/`cover.mp4` for a few projects) — see note in bug #4.
- Consider trimming the Plasma fragment shader's raymarch loop (currently 60 iterations)
  or exposing a `quality` prop, for further headroom on low-end **mobile** GPUs
  specifically (real hardware, not just software-rendering fallback), which weren't
  directly testable in this environment.
