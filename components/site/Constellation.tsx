"use client";
import { useEffect, useRef } from "react";

// The signature brand visual: thousands of tiny outlined triangles forming an
// organic brain shape on pure black, with an ambient scatter around it.
//
// The shape is derived by sampling, not hand-placed: an offscreen mask canvas
// fills a brain silhouette, and particles are rejection-sampled against its
// alpha channel. That keeps the silhouette editable as one path instead of a
// coordinate table, and makes the density uniform for free.

const COLORS = ["#8052FF", "#FFB829", "#15846E", "#B08CFF", "#4C7DFF", "#FF5FD2", "#37D0B0", "#FFFFFF"];

// Vertices are baked at build time (rotation is fixed per particle), so a
// frame only has to add the wobble offset — no per-particle save/rotate/restore.
type Particle = { x: number; y: number; vx: number[]; vy: number[]; phase: number; drift: number };
// Particles are bucketed by (colour x opacity) so a frame issues one stroke()
// per bucket instead of one per triangle. At ~3000 triangles that is the
// difference between ~3000 draw calls a frame and ~24 — the naive version
// pegged a core and froze the tab on a retina display.
type Bucket = { color: string; alpha: number; phase: number; items: Particle[] };
const ALPHA_BUCKETS = 3;

// Brain silhouette in a normalized 0..1 box — a side view: frontal lobe to the
// left, cerebellum bulging at the lower right, short stem below. The gyri
// (folds) are erased back out afterwards; without them the sampled particles
// read as a generic blob rather than a brain.
function drawBrainMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const x = (v: number) => v * w;
  const y = (v: number) => v * h;
  ctx.fillStyle = "#fff";

  // Cerebrum
  ctx.beginPath();
  ctx.moveTo(x(0.07), y(0.50));
  ctx.bezierCurveTo(x(0.04), y(0.27), x(0.20), y(0.07), x(0.44), y(0.07));
  ctx.bezierCurveTo(x(0.68), y(0.01), x(0.92), y(0.13), x(0.93), y(0.35));
  ctx.bezierCurveTo(x(0.97), y(0.50), x(0.88), y(0.59), x(0.76), y(0.61));
  ctx.bezierCurveTo(x(0.71), y(0.72), x(0.56), y(0.80), x(0.40), y(0.78));
  ctx.bezierCurveTo(x(0.21), y(0.79), x(0.08), y(0.68), x(0.07), y(0.50));
  ctx.closePath();
  ctx.fill();

  // Cerebellum
  ctx.beginPath();
  ctx.ellipse(x(0.79), y(0.70), x(0.16), y(0.13), 0, 0, Math.PI * 2);
  ctx.fill();

  // Brain stem
  ctx.beginPath();
  ctx.moveTo(x(0.56), y(0.72));
  ctx.bezierCurveTo(x(0.60), y(0.88), x(0.56), y(0.98), x(0.47), y(0.99));
  ctx.bezierCurveTo(x(0.43), y(0.90), x(0.46), y(0.78), x(0.48), y(0.71));
  ctx.closePath();
  ctx.fill();

  // Gyri — carved back out of the filled shape so the folds show up as
  // negative space in the particle field.
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(3, w * 0.016);

  const fold = (pts: number[][]) => {
    ctx.beginPath();
    ctx.moveTo(x(pts[0][0]), y(pts[0][1]));
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i][0] + pts[i + 1][0]) / 2;
      const midY = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(x(pts[i][0]), y(pts[i][1]), x(midX), y(midY));
    }
    ctx.stroke();
  };

  fold([[0.13, 0.44], [0.24, 0.30], [0.36, 0.42], [0.48, 0.27], [0.60, 0.36]]);
  fold([[0.16, 0.63], [0.30, 0.52], [0.42, 0.62], [0.56, 0.48], [0.70, 0.54]]);
  fold([[0.33, 0.15], [0.46, 0.24], [0.60, 0.13], [0.74, 0.24], [0.86, 0.18]]);
  fold([[0.62, 0.40], [0.74, 0.31], [0.86, 0.42], [0.92, 0.34]]);

  // The fissure separating cerebrum from cerebellum.
  ctx.lineWidth = Math.max(4, w * 0.022);
  ctx.beginPath();
  ctx.moveTo(x(0.62), y(0.63));
  ctx.quadraticCurveTo(x(0.78), y(0.55), x(0.95), y(0.62));
  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";
}

export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let buckets: Bucket[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    function build() {
      const parent = canvas!.parentElement!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The brain occupies a centered box at a fixed 1.3:1 aspect (a squashed
      // or stretched silhouette stops reading as a brain); the rest of the
      // canvas gets ambient scatter so the constellation fades into the void
      // instead of ending at an edge.
      const ASPECT = 1.3;
      const bw = Math.min(w * 0.95, h * 0.92 * ASPECT);
      const bh = bw / ASPECT;
      const ox = (w - bw) / 2;
      const oy = (h - bh) / 2;

      const mask = document.createElement("canvas");
      mask.width = Math.max(1, Math.round(bw));
      mask.height = Math.max(1, Math.round(bh));
      const mctx = mask.getContext("2d");
      if (!mctx) return;
      drawBrainMask(mctx, mask.width, mask.height);
      const data = mctx.getImageData(0, 0, mask.width, mask.height).data;

      // Base alpha per bucket: the brain sits bright, the ambient scatter dim.
      const shapeAlphas = [0.65, 0.8, 0.95];
      const ambientAlphas = [0.14, 0.22, 0.3];
      const next: Bucket[] = [];
      const index = new Map<string, Bucket>();
      const bucketFor = (color: string, group: "shape" | "ambient", tier: number) => {
        const key = `${color}|${group}|${tier}`;
        let bucket = index.get(key);
        if (!bucket) {
          bucket = {
            color,
            alpha: (group === "shape" ? shapeAlphas : ambientAlphas)[tier],
            phase: Math.random() * Math.PI * 2,
            items: [],
          };
          index.set(key, bucket);
          next.push(bucket);
        }
        return bucket;
      };

      const push = (x: number, y: number, size: number, group: "shape" | "ambient", drift: number) => {
        const rot = Math.random() * Math.PI * 2;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const local = [[0, -size], [size * 0.87, size * 0.5], [-size * 0.87, size * 0.5]];
        bucketFor(COLORS[Math.floor(Math.random() * COLORS.length)], group, Math.floor(Math.random() * ALPHA_BUCKETS)).items.push({
          x, y,
          vx: local.map(([lx, ly]) => lx * cos - ly * sin),
          vy: local.map(([lx, ly]) => lx * sin + ly * cos),
          phase: Math.random() * Math.PI * 2,
          drift,
        });
      };

      const target = Math.round(Math.min(2600, (bw * bh) / 130));
      let placed = 0;
      let guard = 0;
      while (placed < target && guard < target * 40) {
        guard++;
        const px = Math.random() * mask.width;
        const py = Math.random() * mask.height;
        if (data[(Math.floor(py) * mask.width + Math.floor(px)) * 4 + 3] < 128) continue;
        push(ox + px, oy + py, 1.8 + Math.random() * 3, "shape", 0.4 + Math.random() * 1.4);
        placed++;
      }

      // Ambient field around the shape, at lower density and opacity.
      const ambient = Math.round(target * 0.22);
      for (let i = 0; i < ambient; i++) {
        push(Math.random() * w, Math.random() * h, 1.4 + Math.random() * 2, "ambient", 0.6 + Math.random() * 1.6);
      }

      buckets = next;
    }

    function render(t: number) {
      const c = ctx!;
      c.clearRect(0, 0, w, h);
      c.lineWidth = 1;
      for (const bucket of buckets) {
        // The whole bucket shares one twinkle phase — at this scale the eye
        // reads a shimmering field either way, and it keeps the per-frame cost
        // at one globalAlpha write and one stroke() per bucket.
        c.globalAlpha = reduced ? bucket.alpha : bucket.alpha * (0.78 + 0.22 * Math.sin(t / 900 + bucket.phase));
        c.strokeStyle = bucket.color;
        c.beginPath();
        for (const p of bucket.items) {
          const wobble = reduced ? 0 : Math.sin(t / 1400 + p.phase) * p.drift;
          const x = p.x + wobble;
          const y = p.y + wobble * 0.6;
          c.moveTo(x + p.vx[0], y + p.vy[0]);
          c.lineTo(x + p.vx[1], y + p.vy[1]);
          c.lineTo(x + p.vx[2], y + p.vy[2]);
          c.closePath();
        }
        c.stroke();
      }
      c.globalAlpha = 1;
    }

    // Stroking a few thousand triangles per frame is the whole cost of this
    // component, so it only runs while the canvas is actually on screen, and
    // at ~30fps rather than 60 — the drift is slow enough that the halved
    // frame rate is invisible, and it halves the GPU/CPU burn on a page the
    // visitor will scroll straight past.
    const FRAME_MS = 33;
    let last = -Infinity;
    let visible = true;

    function loop(t: number) {
      if (t - last >= FRAME_MS) {
        render(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduced) render(performance.now());
      else raf = requestAnimationFrame(loop);
    }

    build();
    start();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    const onResize = () => { build(); if (visible) start(); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden style={{ display: "block", width: "100%", height: "100%" }} />;
}
