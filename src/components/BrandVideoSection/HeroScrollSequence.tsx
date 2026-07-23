import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────
const FRAME_PATH = '/finalmov/finalmov_';
const FRAME_EXT = '.png';
const TOTAL_FRAMES = 192;        // frames 00000 → 00191
const SCROLL_HEIGHT_MULTIPLIER = 5; // scroll distance = 5× viewport
const BUFFER_AHEAD = 30;         // preload this many frames ahead of current
const BUFFER_BEHIND = 15;        // keep this many frames behind current
const BATCH_SIZE = 6;            // concurrent fetches per batch (gentle on server)

/** Pad frame index to 5 digits: 0 → "00000" */
const padFrame = (n: number): string => String(n).padStart(5, '0');

/** Build URL for a given frame index */
const frameUrl = (idx: number): string =>
  `${FRAME_PATH}${padFrame(idx)}${FRAME_EXT}`;

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────
const HeroScrollSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Use desynchronized for lower latency on fast scrolls
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    // ── State ──────────────────────────────────────────────────────
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    const loadingSet = new Set<number>(); // track in-flight requests
    let currentFrame = 0;
    let isDestroyed = false;
    let isVisible = false;

    // ── Canvas sizing (High-DPI aware) ────────────────────────────
    const sizeCanvas = () => {
      // Limit DPR to 1.5 to prevent massive 4K decoding lag on high-DPI screens
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        // Reset transform after resize to apply fresh DPR scale
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    // ── Draw a specific frame onto the canvas ─────────────────────
    const drawFrame = (frameIdx: number) => {
      const img = images[frameIdx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        // If requested frame isn't loaded yet, find nearest loaded frame
        for (let offset = 1; offset < 10; offset++) {
          const fallback = images[frameIdx - offset];
          if (fallback && fallback.complete && fallback.naturalWidth > 0) {
            renderImage(fallback);
            return;
          }
        }
        return;
      }
      renderImage(img);
    };

    /** Render an Image element onto the canvas with cover-fit */
    const renderImage = (img: HTMLImageElement) => {
      sizeCanvas();
      const displayW = canvas.clientWidth;
      const displayH = canvas.clientHeight;

      // Cover-fit calculation
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = displayW / displayH;

      let dw: number, dh: number, dx: number, dy: number;
      if (imgRatio > canvasRatio) {
        dh = displayH;
        dw = displayH * imgRatio;
        dx = (displayW - dw) / 2;
        dy = 0;
      } else {
        dw = displayW;
        dh = displayW / imgRatio;
        dx = 0;
        dy = (displayH - dh) / 2;
      }

      ctx.clearRect(0, 0, displayW, displayH);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    // ── Single image loader ───────────────────────────────────────
    const loadImage = (idx: number): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        if (images[idx]?.complete) { resolve(images[idx]); return; }
        if (loadingSet.has(idx)) { resolve(null); return; }
        loadingSet.add(idx);
        const img = new Image();
        img.decoding = 'async';
        img.src = frameUrl(idx);
        img.onload = () => {
          if (!isDestroyed) images[idx] = img;
          loadingSet.delete(idx);
          resolve(img);
        };
        img.onerror = () => {
          loadingSet.delete(idx);
          resolve(null);
        };
      });

    // ── Load frames around the current scroll position ────────────
    const loadFramesAroundCurrent = async () => {
      if (isDestroyed || !isVisible) return;

      const center = currentFrame;
      const start = Math.max(0, center - BUFFER_BEHIND);
      const end = Math.min(TOTAL_FRAMES - 1, center + BUFFER_AHEAD);

      // Build a list of frames that need loading, prioritized by proximity
      const toLoad: number[] = [];
      for (let i = center; i <= end; i++) {
        if (!images[i]?.complete && !loadingSet.has(i)) toLoad.push(i);
      }
      for (let i = center - 1; i >= start; i--) {
        if (!images[i]?.complete && !loadingSet.has(i)) toLoad.push(i);
      }

      // Load in small batches to avoid flooding the network
      for (let b = 0; b < toLoad.length; b += BATCH_SIZE) {
        if (isDestroyed) return;
        const batch = toLoad.slice(b, b + BATCH_SIZE);
        await Promise.all(batch.map(loadImage));
      }
    };

    // ── Initial bootstrap: load frame 0, then nearby frames ───────
    const bootstrap = async () => {
      // Load first frame immediately so canvas isn't empty
      await loadImage(0);
      if (!isDestroyed) drawFrame(0);

      // Load the first ~10 frames for smooth initial scroll
      const initialBatch = [];
      for (let i = 1; i <= Math.min(10, TOTAL_FRAMES - 1); i++) {
        initialBatch.push(loadImage(i));
      }
      await Promise.all(initialBatch);
    };

    // ── IntersectionObserver: defer heavy loading until visible ────
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          loadFramesAroundCurrent();
        }
      },
      { rootMargin: '200px 0px' } // start loading 200px before entering viewport
    );
    observer.observe(container);

    // ── GSAP ScrollTrigger Setup ──────────────────────────────────
    const proxy = { frame: 0 };

    const tween = gsap.to(proxy, {
      frame: TOTAL_FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${window.innerHeight * SCROLL_HEIGHT_MULTIPLIER}`,
        scrub: 0.3,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const newFrame = Math.round(proxy.frame);
        const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, newFrame));
        if (clamped !== currentFrame) {
          currentFrame = clamped;
          drawFrame(clamped);
          // Trigger loading of nearby frames on scroll
          loadFramesAroundCurrent();
        }
      },
    });

    // ── Start initial load ────────────────────────────────────────
    bootstrap();

    // ── Handle window resize ──────────────────────────────────────
    const onResize = () => {
      sizeCanvas();
      drawFrame(currentFrame);
    };
    window.addEventListener('resize', onResize);

    // ── Refresh ScrollTrigger after a short delay ─────────────────
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      isDestroyed = true;
      clearTimeout(refreshTimer);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-scroll-sequence">
      <canvas ref={canvasRef} className="hero-scroll-canvas" />
      <div className="hero-scroll-overlay" />
    </div>
  );
};

export default HeroScrollSequence;

