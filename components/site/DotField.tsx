"use client";
import { useEffect, useRef } from "react";

// The drifting speck field behind the page. Tiny squares rather than the
// triangles of the previous design — sparse, mostly warm grey with occasional
// purple and lime, so it reads as texture on the paper rather than as artwork.
//
// Colours sampled from the reference: #8e7ce0 purple against warm dark greys,
// with the brand lime appearing rarely.
const COLORS = [
  { hex: "#3a352f", weight: 62 },
  { hex: "#6f58cd", weight: 22 },
  { hex: "#8e7ce0", weight: 10 },
  { hex: "#b8ff2e", weight: 6 },
];

type Speck = { x: number; y: number; size: number; color: string; alpha: number; phase: number; drift: number };

/** Deterministic PRNG so the field is identical across renders and resizes. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickColor(rand: () => number) {
  const total = COLORS.reduce((s, c) => s + c.weight, 0);
  let roll = rand() * total;
  for (const c of COLORS) {
    roll -= c.weight;
    if (roll <= 0) return c.hex;
  }
  return COLORS[0].hex;
}

export default function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let specks: Speck[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let visible = true;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // One speck per ~3200px² keeps the field readable as texture. Denser and
      // it turns into noise behind the copy.
      const rand = mulberry32(20260819);
      const count = Math.round((w * h) / 3200);
      specks = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        size: rand() < 0.18 ? 4 : rand() < 0.55 ? 3 : 2,
        color: pickColor(rand),
        alpha: 0.35 + rand() * 0.55,
        phase: rand() * Math.PI * 2,
        drift: 0.5 + rand() * 1.8,
      }));
    }

    function render(t: number) {
      const c = ctx!;
      c.clearRect(0, 0, w, h);
      for (const s of specks) {
        const wobble = reduced ? 0 : Math.sin(t / 3200 + s.phase) * s.drift;
        const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(t / 2100 + s.phase * 1.7);
        c.globalAlpha = s.alpha * twinkle;
        c.fillStyle = s.color;
        c.fillRect(s.x + wobble, s.y + wobble * 0.5, s.size, s.size);
      }
      c.globalAlpha = 1;
    }

    // ~30fps: the drift is slow enough that halving the frame rate is invisible
    // and it keeps the field off the critical path on a scrolling page.
    const FRAME_MS = 33;
    let last = -Infinity;
    function loop(t: number) {
      if (t - last >= FRAME_MS) {
        render(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (!reduced) raf = requestAnimationFrame(loop);
    }

    // Paint one frame synchronously: a tab opened in the background has rAF
    // throttled off and would otherwise show an empty canvas until focused.
    build();
    render(performance.now());
    start();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        render(performance.now());
        if (visible) start();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="dotfield" />;
}
