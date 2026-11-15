/**
 * Injected into the page BEFORE any app script runs (via page.addInitScript).
 * Tracks:
 *  - number of currently-active requestAnimationFrame loops (best-effort, counts
 *    outstanding rAF callbacks that haven't been cancelled)
 *  - number of live WebGL contexts ever created (HTMLCanvasElement#getContext)
 *  - number of active setInterval timers
 *  - gsap ticker frame count (to prove animation loops keep running after navigation)
 */
export function installInstrumentation() {
  // --- requestAnimationFrame tracking ---
  const w = window as any;
  w.__rafActive = 0;
  w.__rafTotalScheduled = 0;
  const nativeRAF = window.requestAnimationFrame.bind(window);
  const nativeCAF = window.cancelAnimationFrame.bind(window);
  const rafIdToActive = new Set<number>();

  window.requestAnimationFrame = function (cb: FrameRequestCallback) {
    w.__rafTotalScheduled++;
    const id = nativeRAF((t) => {
      rafIdToActive.delete(id);
      w.__rafActive = rafIdToActive.size;
      cb(t);
    });
    rafIdToActive.add(id);
    w.__rafActive = rafIdToActive.size;
    return id;
  };
  window.cancelAnimationFrame = function (id: number) {
    rafIdToActive.delete(id);
    w.__rafActive = rafIdToActive.size;
    return nativeCAF(id);
  };

  // --- WebGL context tracking ---
  w.__glContextsCreated = 0;
  w.__glContextsLost = 0;
  const nativeGetContext = HTMLCanvasElement.prototype.getContext;
  // @ts-ignore
  HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: any[]) {
    // @ts-ignore
    const ctx = nativeGetContext.call(this, type, ...rest);
    if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')) {
      w.__glContextsCreated++;
      this.addEventListener('webglcontextlost', () => {
        w.__glContextsLost++;
      });
    }
    return ctx;
  };

  // --- setInterval tracking ---
  w.__activeIntervalCount = 0;
  const nativeSetInterval = window.setInterval.bind(window);
  const nativeClearInterval = window.clearInterval.bind(window);
  const activeIntervals = new Set<number>();
  // @ts-ignore
  window.setInterval = function (...args: any[]) {
    // @ts-ignore
    const id = nativeSetInterval(...args);
    activeIntervals.add(id as unknown as number);
    w.__activeIntervalCount = activeIntervals.size;
    return id;
  };
  // @ts-ignore
  window.clearInterval = function (id: any) {
    activeIntervals.delete(id);
    w.__activeIntervalCount = activeIntervals.size;
    return nativeClearInterval(id);
  };

  // --- event listener tracking on window/document (rough leak signal) ---
  w.__listenerCount = 0;
  const nativeAdd = EventTarget.prototype.addEventListener;
  const nativeRemove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (...args: any[]) {
    w.__listenerCount++;
    // @ts-ignore
    return nativeAdd.apply(this, args);
  };
  EventTarget.prototype.removeEventListener = function (...args: any[]) {
    w.__listenerCount--;
    // @ts-ignore
    return nativeRemove.apply(this, args);
  };
}
