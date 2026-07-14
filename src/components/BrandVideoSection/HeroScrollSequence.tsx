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

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // ── State ──────────────────────────────────────────────────────
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    let currentFrame = 0;
    let isDestroyed = false;

    // ── Canvas sizing (High-DPI aware) ────────────────────────────
    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
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

    // ── Image preloader ───────────────────────────────────────────
    const loadImage = (idx: number): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        if (images[idx]?.complete) { resolve(images[idx]); return; }
        const img = new Image();
        img.decoding = 'async';
        img.src = frameUrl(idx);
        img.onload = () => {
          if (!isDestroyed) images[idx] = img;
          resolve(img);
        };
        img.onerror = () => resolve(null);
      });

    // ── Phase 1: Load first frame immediately, then batch the rest ─
    const preloadAll = async () => {
      // Load frame 0 first so we can show something immediately
      await loadImage(0);
      if (!isDestroyed) drawFrame(0);

      // Load all remaining frames in parallel batches
      const BATCH = 20;
      for (let start = 1; start < TOTAL_FRAMES; start += BATCH) {
        if (isDestroyed) return;
        const promises: Promise<HTMLImageElement | null>[] = [];
        for (let i = start; i < Math.min(start + BATCH, TOTAL_FRAMES); i++) {
          promises.push(loadImage(i));
        }
        await Promise.all(promises);
      }
    };

    // ── GSAP ScrollTrigger Setup ──────────────────────────────────
    // We use a simple proxy object whose `frame` property is
    // animated from 0 → TOTAL_FRAMES-1 by ScrollTrigger.
    const proxy = { frame: 0 };

    const tween = gsap.to(proxy, {
      frame: TOTAL_FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${window.innerHeight * SCROLL_HEIGHT_MULTIPLIER}`,
        scrub: 0.3,          // smooth interpolation (works great with Lenis)
        pin: true,            // pin the container during the animation
        anticipatePin: 1,     // compensate for pinning glitches
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const newFrame = Math.round(proxy.frame);
        // Clamp to valid range
        const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, newFrame));
        if (clamped !== currentFrame) {
          currentFrame = clamped;
          drawFrame(clamped);
        }
      },
    });

    // ── Start preloading images ───────────────────────────────────
    preloadAll();

    // ── Handle window resize ──────────────────────────────────────
    const onResize = () => {
      sizeCanvas();
      drawFrame(currentFrame);
    };
    window.addEventListener('resize', onResize);

    // ── Refresh ScrollTrigger after a short delay ─────────────────
    // This ensures Lenis + ScrollTrigger have both initialized
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      isDestroyed = true;
      clearTimeout(refreshTimer);
      window.removeEventListener('resize', onResize);
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
