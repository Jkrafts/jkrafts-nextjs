import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Plasma.css';
import { PAGE_COVER_EVENT, isPageCovered } from '@/lib/pageTransition';

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: 'forward' | 'reverse' | 'pingpong';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
  /**
   * Caps how often the (expensive, 60-step raymarched) fragment shader is
   * actually re-rendered. The animation is slow/ambient, so 60fps is
   * imperceptibly different from ~30fps here but roughly halves the GPU/CPU
   * cost of this component. Set to a higher value (e.g. 60) to disable capping.
   */
  maxFps?: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma: React.FC<PlasmaProps> = ({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  maxFps = 30
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Capture the DOM node in a local variable rather than reading
    // `containerRef.current` throughout the rest of this effect (including
    // in the cleanup function returned below). React nulls out a ref's
    // `.current` synchronously as part of unmounting - *before* this
    // effect's cleanup runs - so anything here that read
    // `containerRef.current` again later (directly, or indirectly via an
    // async ResizeObserver/event callback that outlives this render) could
    // see it as `null` despite the node itself still being perfectly valid
    // for our purposes (removing listeners, tearing down observers, etc).
    // Closing over this local `container` instead sidesteps that race
    // entirely.
    const container = containerRef.current;
    if (!container) return;

    // Respect the user's OS-level motion preference: skip creating a WebGL
    // context and running an infinite render loop entirely. This is both an
    // accessibility improvement and a meaningful CPU/battery saving for users
    // who've explicitly opted out of animations.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      container.dataset.fallback = 'true';
      return;
    }

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        // The shader's per-pixel raymarch cost scales with pixel count. Phones
        // have dense screens but weak GPUs, and this soft effect gains nothing
        // visible from 2-3x resolution there, so render at 1x on small viewports.
        dpr: Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 2)
      });
    } catch {
      renderer = null as unknown as Renderer;
    }
    // No WebGL (blocked, unsupported, or context limit hit): show the static
    // fallback instead of throwing.
    if (!renderer?.gl) {
      container.dataset.fallback = 'true';
      return;
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;

    // Detect a software (CPU-emulated) WebGL renderer, e.g. SwiftShader or
    // llvmpipe. These show up on locked-down corporate machines, some
    // VMs/remote desktops/CI environments, and browsers with hardware
    // acceleration disabled. On a software rasterizer, this shader's 60-step
    // per-pixel raymarch loop can cost hundreds of ms per frame (confirmed via
    // profiling), pegging the CPU. Since the loop cost scales with pixel
    // count, we render at a fraction of the resolution in that case and let
    // the browser upscale it — visually negligible for this soft/blurred
    // effect, but a quadratic reduction in per-frame cost.
    let renderScale = 1;
    try {
      const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererString = (
        dbgInfo ? gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
      ) as string;
      if (/swiftshader|llvmpipe|software|basic render/i.test(rendererString || '')) {
        renderScale = 0.35;
      }
    } catch {
      // WEBGL_debug_renderer_info not available; assume hardware rendering.
    }
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive) return;
      const rect = container.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };

    if (mouseInteractive) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * renderScale));
      const height = Math.max(1, Math.floor(rect.height * renderScale));
      renderer.setSize(width, height);
      // Keep the canvas's CSS box at the container's real size; only the
      // internal (backing store) resolution is reduced, so the browser
      // upscales the result rather than shrinking the element on screen.
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    // Mounted under the page transition's curtain (arriving at this page):
    // draw one frame now, while hidden, so the shader compiles and the canvas
    // has content before the reveal. Otherwise that first, slowest frame
    // would land just as the curtain lifts. The loop itself still waits.
    if (isPageCovered()) renderer.render({ scene: mesh });

    // -------------------------------------------------------------
    // Visibility gating: the fragment shader below does a 60-step
    // raymarch per pixel every frame. That is expensive on the GPU
    // (and *very* expensive on the CPU when hardware WebGL isn't
    // available, e.g. locked-down corporate machines, some VMs/remote
    // desktops, or low-power devices that fall back to a software
    // renderer). Previously the render loop ran forever regardless of
    // whether the canvas was on-screen or the tab was even visible,
    // which is the main source of the reported CPU spikes. We now
    // pause rendering whenever the canvas is scrolled out of view or
    // the tab is backgrounded, and resume seamlessly (adjusting the
    // time origin so the animation doesn't jump).
    let raf = 0;
    let isRunning = false;
    let isIntersecting = false;
    let pausedAt = 0;
    let t0 = performance.now();
    let lastRenderTime = 0;
    const minFrameInterval = maxFps > 0 ? 1000 / maxFps : 0;

    const loop = (t: number) => {
      // FPS cap: still schedule the next rAF (cheap) but skip the expensive
      // uniform update + shader render if we're rendering faster than
      // `maxFps`. This is a slow ambient animation, so capping it well below
      // display refresh rate is visually indistinguishable while roughly
      // halving (or more) its GPU/CPU cost.
      if (minFrameInterval && t - lastRenderTime < minFrameInterval) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastRenderTime = t;

      const timeValue = (t - t0) * 0.001;
      if (direction === 'pingpong') {
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward ? smooth * pingpongDuration : (1 - smooth) * pingpongDuration;
        (program.uniforms.uDirection as { value: number }).value = 1.0;
        (program.uniforms.iTime as { value: number }).value = pingpongTime;
      } else {
        (program.uniforms.iTime as { value: number }).value = timeValue;
      }
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    // Also held while a page transition runs (leaving or arriving at this
    // page): the curtain's motion gets every frame, and with software WebGL
    // the shader would otherwise starve it. It resumes once revealed.
    const shouldRun = () => isIntersecting && !document.hidden && !isPageCovered();

    const start = () => {
      if (isRunning) return;
      isRunning = true;
      // Shift the time origin forward by however long we were paused so
      // the shader doesn't "jump" when it resumes.
      if (pausedAt) {
        t0 += performance.now() - pausedAt;
        pausedAt = 0;
      }
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!isRunning) return;
      isRunning = false;
      pausedAt = performance.now();
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (shouldRun()) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const handleVisibilityChange = () => {
      if (shouldRun()) start();
      else stop();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(PAGE_COVER_EVENT, handleVisibilityChange);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(PAGE_COVER_EVENT, handleVisibilityChange);
      ro.disconnect();
      if (mouseInteractive) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      try {
        container.removeChild(canvas);
      } catch {}
      // Explicitly release the GPU context instead of waiting for the
      // browser to garbage-collect the detached canvas. Browsers cap the
      // number of *live* WebGL contexts per page (Chromium: 16); once that
      // cap is hit, the browser force-loses an existing context (context
      // loss is silent - draw calls just become no-ops, so the canvas
      // renders nothing) to make room for a new one. Since this component
      // remounts on every client-side navigation back to this page, without
      // this call each visit leaves its old context alive-but-orphaned until
      // GC gets around to it, so a handful of navigation cycles could
      // silently blank out the *newest* Plasma instance - exactly the "only
      // works after a hard refresh" symptom, since a full reload starts
      // from zero contexts. `WEBGL_lose_context` is the spec-sanctioned way
      // to force-release a context's resources deterministically.
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {}
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive, maxFps]);

  return <div ref={containerRef} className="plasma-container" />;
};

export default Plasma;
