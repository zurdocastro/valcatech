"use client";
import { useEffect, useRef } from "react";

// The signature brand visual: thousands of tiny outlined triangles that form a
// shape and morph between shapes as the page scrolls.
//
// The reference implementation (dala.craftedbygc.com) instances pyramid meshes
// whose positions come from a baked EXR texture, driven by a global
// `sectionProgress` that spans the whole page. The same behaviour is
// reproduced here with a plain 2D canvas and no 3D dependency:
//
//   - every shape is a 3D point cloud of the same length, so morphing between
//     two of them is a straight lerp
//   - organic shapes (brain, head) are rejection-sampled from a silhouette
//     drawn on an offscreen mask, then given volume along z
//   - the cloud rotates on y and is perspective-projected, so it reads as a
//     solid object rather than a flat sticker
//   - particles are batched by colour and depth band, so a frame issues a few
//     dozen stroke() calls instead of one per triangle

// The reference does not colour particles at random — colour tracks how the
// surface faces a light coming from the upper left: gold along the lit rim,
// white where the surface faces the viewer, violet and blue falling away into
// shadow. Random colour per particle is exactly what makes a particle field
// read as confetti instead of as a lit object.
const RAMP = ["#FFB829", "#FFD98A", "#FFFFFF", "#DCD6F5", "#B08CFF", "#8052FF", "#4C7DFF", "#15846E"];

const DEPTH_BANDS = 5; // Far-to-near bands; drive size, alpha and draw order.
const CAMERA = 3.2; // Perspective distance in shape-space units.

type Vec3 = { x: number; y: number; z: number };

type Particle = {
  /** One position per shape — index matches SHAPE_NAMES. */
  shapes: Vec3[];
  size: number;
  spin: number;
  phase: number;
  /** Small per-particle shift along the ramp, so the field keeps chromatic
   *  variety without dissolving into noise. */
  tint: number;
};

/** Big outlined glyphs drifting in front of the field, as in the reference. */
type Glyph = { x: number; y: number; size: number; spin: number; drift: number; color: string; alpha: number };

// ---------------------------------------------------------------- silhouettes

// Side view: frontal lobe left, cerebellum bulging at the lower right, short
// stem below. The gyri are erased back out — without them the sampled points
// read as a generic blob rather than a brain.
function drawBrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const x = (v: number) => v * w;
  const y = (v: number) => v * h;
  ctx.fillStyle = "#fff";

  ctx.beginPath();
  ctx.moveTo(x(0.07), y(0.50));
  ctx.bezierCurveTo(x(0.04), y(0.27), x(0.20), y(0.07), x(0.44), y(0.07));
  ctx.bezierCurveTo(x(0.68), y(0.01), x(0.92), y(0.13), x(0.93), y(0.35));
  ctx.bezierCurveTo(x(0.97), y(0.50), x(0.88), y(0.59), x(0.76), y(0.61));
  ctx.bezierCurveTo(x(0.71), y(0.72), x(0.56), y(0.80), x(0.40), y(0.78));
  ctx.bezierCurveTo(x(0.21), y(0.79), x(0.08), y(0.68), x(0.07), y(0.50));
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x(0.79), y(0.70), x(0.16), y(0.13), 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x(0.56), y(0.72));
  ctx.bezierCurveTo(x(0.60), y(0.88), x(0.56), y(0.98), x(0.47), y(0.99));
  ctx.bezierCurveTo(x(0.43), y(0.90), x(0.46), y(0.78), x(0.48), y(0.71));
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(4, w * 0.026);

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

  ctx.lineWidth = Math.max(5, w * 0.032);
  ctx.beginPath();
  ctx.moveTo(x(0.62), y(0.63));
  ctx.quadraticCurveTo(x(0.78), y(0.55), x(0.95), y(0.62));
  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";
}

// Lightbulb: glass envelope drawn as a hollow wall so it reads as glass you can
// see through, filament inside, threaded base below.
function drawBulb(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const x = (v: number) => v * w;
  const y = (v: number) => v * h;
  ctx.fillStyle = "#fff";

  // Glass envelope.
  ctx.beginPath();
  ctx.ellipse(x(0.5), y(0.30), x(0.40), y(0.25), 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck tapering into the base.
  ctx.beginPath();
  ctx.moveTo(x(0.30), y(0.44));
  ctx.bezierCurveTo(x(0.34), y(0.54), x(0.38), y(0.56), x(0.38), y(0.62));
  ctx.lineTo(x(0.62), y(0.62));
  ctx.bezierCurveTo(x(0.62), y(0.56), x(0.66), y(0.54), x(0.70), y(0.44));
  ctx.closePath();
  ctx.fill();

  // Screw base.
  ctx.beginPath();
  ctx.moveTo(x(0.38), y(0.62));
  ctx.lineTo(x(0.62), y(0.62));
  ctx.lineTo(x(0.60), y(0.92));
  ctx.bezierCurveTo(x(0.58), y(0.98), x(0.42), y(0.98), x(0.40), y(0.92));
  ctx.closePath();
  ctx.fill();

  // Threads on the base.
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, w * 0.022);
  for (const ty of [0.70, 0.78, 0.86]) {
    ctx.beginPath();
    ctx.moveTo(x(0.38), y(ty));
    ctx.lineTo(x(0.62), y(ty));
    ctx.stroke();
  }
  // Filament, carved out of the envelope so it reads as a void in the glass.
  ctx.lineWidth = Math.max(3, w * 0.030);
  ctx.beginPath();
  ctx.moveTo(x(0.43), y(0.46));
  ctx.lineTo(x(0.43), y(0.34));
  ctx.lineTo(x(0.47), y(0.26));
  ctx.lineTo(x(0.50), y(0.34));
  ctx.lineTo(x(0.53), y(0.26));
  ctx.lineTo(x(0.57), y(0.34));
  ctx.lineTo(x(0.57), y(0.46));
  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";
}

// --------------------------------------------------------------- point clouds

/** Rejection-samples `count` points from a silhouette, then gives them volume. */
function sampleSilhouette(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  count: number,
  aspect: number,
  thickness: number,
  rand: () => number
): Vec3[] {
  const mw = 260;
  const mh = Math.max(1, Math.round(mw / aspect));
  const mask = document.createElement("canvas");
  mask.width = mw;
  mask.height = mh;
  const mctx = mask.getContext("2d", { willReadFrequently: true });
  if (!mctx) return [];
  draw(mctx, mw, mh);
  const data = mctx.getImageData(0, 0, mw, mh).data;

  const inside = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= mw || py >= mh) return false;
    return data[((py | 0) * mw + (px | 0)) * 4 + 3] >= 128;
  };

  // How close a point is to any edge of the silhouette — its own outline and
  // the channels carved into it. Sampling uniformly across the filled area
  // buries that structure under interior noise: the brain's folds and the
  // bulb's outline only read once points concentrate on the edges, which is
  // what makes the reference's shapes legible at a glance.
  const PROBE = Math.max(3, Math.round(mw * 0.028));
  const edgeness = (px: number, py: number) => {
    let outside = 0;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      if (!inside(px + Math.cos(angle) * PROBE, py + Math.sin(angle) * PROBE)) outside++;
    }
    return outside / 8;
  };

  const out: Vec3[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 120) {
    guard++;
    const px = rand() * mw;
    const py = rand() * mh;
    if (data[(Math.floor(py) * mw + Math.floor(px)) * 4 + 3] < 128) continue;
    // Interior points still appear, just sparsely, so the shape keeps volume.
    if (rand() > 0.45 + 0.55 * edgeness(px, py)) continue;
    // Normalised so the longer axis spans [-1, 1].
    const nx = (px / mw - 0.5) * 2;
    const ny = ((py / mh - 0.5) * 2) / aspect;
    // Lens-shaped thickness: full depth mid-shape, tapering towards the
    // silhouette edge, so a rotated cloud has believable volume rather than
    // being a flat slab seen edge-on.
    const edge = Math.max(0, 1 - Math.hypot(nx, ny * aspect));
    const z = (rand() * 2 - 1) * thickness * Math.sqrt(edge);
    out.push({ x: nx, y: ny, z });
  }
  // Rejection sampling can fall short on a thin silhouette. Every cloud must be
  // the same length for the morph to stay a straight lerp, so pad by cycling
  // through what was sampled rather than repeating a single point (which would
  // stack the whole remainder on one spot).
  if (out.length === 0) return Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0 }));
  const sampled = out.length;
  for (let i = sampled; i < count; i++) out.push(out[i % sampled]);
  return out;
}

/** Fibonacci sphere — even coverage, no polar clustering. */
function sampleSphere(count: number, radius: number): Vec3[] {
  const out: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push({ x: Math.cos(theta) * r * radius, y: y * radius, z: Math.sin(theta) * r * radius });
  }
  return out;
}

/** Loose ball of points — the dispersed state between the solid shapes. */
function sampleScatter(count: number, radius: number, rand: () => number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const r = radius * Math.cbrt(rand());
    const s = Math.sqrt(Math.max(0, 1 - u * u));
    out.push({ x: Math.cos(theta) * s * r, y: u * r, z: Math.sin(theta) * s * r });
  }
  return out;
}

// Shape order; a section names one of these in `data-shape`.
const SHAPE_NAMES: string[] = ["brain", "sphere", "bulb", "scatter"];

// Deterministic PRNG so the cloud is identical across rebuilds and resizes — a
// Math.random() cloud would reshuffle on every resize and make the shape jump.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let glyphs: Glyph[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let baseScale = 1;
    let particleCount = 0;
    let slots: HTMLElement[] = [];

    // The field eases towards whatever the active section asks for rather than
    // snapping, so switching sides reads as the cloud travelling across the
    // page — the reference's behaviour.
    const view = { x: 0, y: 0, scale: 1, alpha: 0.12, shape: 0 };
    let primed = false;

    /** Cheap: canvas size, projection scale and the section slots. */
    function measure() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      baseScale = Math.min(w * (w >= 900 ? 0.33 : 0.46), h * 0.44);
      slots = Array.from(document.querySelectorAll<HTMLElement>("[data-orb]"));
      return Math.round(Math.min(5600, (w * h) / 280));
    }

    /**
     * Expensive: re-samples every cloud. The clouds are in normalised
     * coordinates, so a resize only needs this when the particle count itself
     * changes — otherwise dragging a window would re-sample 12k points per
     * frame for no visible difference.
     */
    function buildClouds(count: number) {
      particleCount = count;
      const rand = mulberry32(20260817);

      const clouds: Vec3[][] = [
        sampleSilhouette(drawBrain, count, 1.3, 0.42, rand),
        sampleSphere(count, 1),
        sampleSilhouette(drawBulb, count, 0.62, 0.34, rand),
        sampleScatter(count, 1.5, rand),
      ];

      const next: Particle[] = [];
      for (let i = 0; i < count; i++) {
        next.push({
          shapes: clouds.map((c) => c[i]),
          size: 1.3 + rand() * 1.7,
          spin: rand() * Math.PI * 2,
          phase: rand() * Math.PI * 2,
          tint: Math.round(rand() * 2) - 1,
        });
      }
      particles = next;

      glyphs = Array.from({ length: 14 }, () => ({
        x: rand(),
        y: rand(),
        size: 22 + rand() * 46,
        spin: rand() * Math.PI * 2,
        drift: 0.4 + rand() * 1.2,
        color: RAMP[Math.floor(rand() * 5)],
        alpha: 0.06 + rand() * 0.14,
      }));
    }

    /**
     * Each section that has a free half declares which side the field belongs
     * on and which shape it should be wearing. The slot nearest the middle of
     * the viewport wins; with none in view the field falls back to a dim,
     * centred ambient state so it never fights body copy for legibility.
     */
    function target() {
      const wide = w >= 900;
      let best: HTMLElement | null = null;
      let bestDistance = Infinity;

      for (const slot of slots) {
        const rect = slot.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= h) continue;
        const distance = Math.abs(rect.top + rect.height / 2 - h / 2);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = slot;
        }
      }

      if (!best) return { x: w * 0.5, y: h * 0.5, scale: baseScale * 1.15, alpha: 0.12, shape: view.shape };

      const rect = best.getBoundingClientRect();
      const side = best.dataset.orb === "left" ? 0.30 : 0.70;
      const shape = Math.max(0, SHAPE_NAMES.indexOf(best.dataset.shape ?? "brain"));
      return {
        // Below the two-column breakpoint there is no free half, so the field
        // centres and drops right back — the copy has to win.
        x: wide ? w * side : w * 0.5,
        y: Math.min(h * 0.72, Math.max(h * 0.28, rect.top + rect.height / 2)),
        scale: baseScale * (wide ? 1 : 0.8),
        alpha: wide ? 1 : 0.35,
        shape,
      };
    }

    function render(t: number) {
      const c = ctx!;
      c.clearRect(0, 0, w, h);

      // Ease every property towards the active section's request. On the very
      // first frame we snap, so the hero opens already composed.
      const want = target();
      const ease = primed ? (reduced ? 1 : 0.08) : 1;
      primed = true;
      view.x += (want.x - view.x) * ease;
      view.y += (want.y - view.y) * ease;
      view.scale += (want.scale - view.scale) * ease;
      view.alpha += (want.alpha - view.alpha) * ease;
      view.shape += (want.shape - view.shape) * ease;

      const originX = view.x;
      const originY = view.y;
      const scale = view.scale;

      const p = view.shape;
      const from = Math.min(SHAPE_NAMES.length - 1, Math.max(0, Math.floor(p)));
      const to = Math.min(SHAPE_NAMES.length - 1, from + 1);
      const blend = smoothstep(Math.min(1, Math.max(0, p - from)));

      // A full spin would swing the brain and the head profile edge-on, where
      // neither silhouette reads. The reference sways rather than spins, so the
      // shape stays recognisable: a slow ±20° oscillation, plus a little more
      // yaw carried by the scroll itself.
      const spin = reduced ? 0.2 : Math.sin(t / 6000) * 0.35 + p * 0.12;
      const cosY = Math.cos(spin);
      const sinY = Math.sin(spin);
      const tilt = 0.18;
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      // Light from the upper left, slightly in front. Shading a point cloud by
      // how its surface faces this is what turns a scatter of coloured
      // triangles into a legible, lit object.
      const LX = -0.55, LY = -0.62, LZ = 0.56;

      // Binned by ramp step and depth: one stroke() per pair, so the whole
      // field costs a few dozen draw calls no matter how many particles.
      const paths: Path2D[] = Array.from({ length: RAMP.length * DEPTH_BANDS }, () => new Path2D());

      for (const particle of particles) {
        const a = particle.shapes[from];
        const b = particle.shapes[to];
        const x0 = a.x + (b.x - a.x) * blend;
        const y0 = a.y + (b.y - a.y) * blend;
        const z0 = a.z + (b.z - a.z) * blend;

        // Rotate on y, then tilt on x.
        const rx = x0 * cosY + z0 * sinY;
        const rz = -x0 * sinY + z0 * cosY;
        const ry = y0 * cosX - rz * sinX;
        const rzz = y0 * sinX + rz * cosX;

        // Every cloud is centred on the origin, so the direction out from the
        // centre stands in for the surface normal — accurate enough for a
        // shell, and free, since the rotated position is already to hand.
        const len = Math.hypot(rx, ry, rzz) || 1;
        const lit = (rx * LX + ry * LY + rzz * LZ) / len;
        const step = Math.min(
          RAMP.length - 1,
          Math.max(0, Math.round((1 - (lit + 1) / 2) * (RAMP.length - 1)) + particle.tint)
        );

        // Perspective: nearer points are larger and spread further apart.
        const depth = CAMERA / (CAMERA + rzz);
        const drift = reduced ? 0 : Math.sin(t / 1600 + particle.phase) * 1.2;
        const cx = originX + rx * scale * depth + drift;
        const cy = originY + ry * scale * depth + drift * 0.6;

        const size = particle.size * depth;
        const rot = particle.spin + spin * 0.5;
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);

        const band = Math.min(DEPTH_BANDS - 1, Math.max(0, Math.floor(((depth - 0.65) / 0.75) * DEPTH_BANDS)));
        const path = paths[step * DEPTH_BANDS + band];
        path.moveTo(cx + size * sr, cy - size * cr);
        path.lineTo(cx + (size * 0.87 * cr - size * 0.5 * sr), cy + (size * 0.87 * sr + size * 0.5 * cr));
        path.lineTo(cx + (-size * 0.87 * cr - size * 0.5 * sr), cy + (-size * 0.87 * sr + size * 0.5 * cr));
        path.closePath();
      }

      c.lineWidth = 1;
      // Furthest band first so nearer, brighter particles land on top.
      for (let band = 0; band < DEPTH_BANDS; band++) {
        c.globalAlpha = (0.28 + (band / (DEPTH_BANDS - 1)) * 0.62) * view.alpha;
        for (let step = 0; step < RAMP.length; step++) {
          c.strokeStyle = RAMP[step];
          c.stroke(paths[step * DEPTH_BANDS + band]);
        }
      }

      // Foreground glyphs: a handful of large outlined triangles drifting in
      // front of the field, the decorative layer the reference floats over its
      // hero art.
      c.lineWidth = 1.5;
      for (const glyph of glyphs) {
        const wobble = reduced ? 0 : Math.sin(t / 4200 + glyph.spin) * 26 * glyph.drift;
        const gx = glyph.x * w + wobble;
        const gy = glyph.y * h + wobble * 0.5;
        const rot = glyph.spin + (reduced ? 0 : t / 26000) * glyph.drift;
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);
        const gs = glyph.size;
        c.globalAlpha = glyph.alpha * view.alpha;
        c.strokeStyle = glyph.color;
        c.beginPath();
        c.moveTo(gx + gs * sr, gy - gs * cr);
        c.lineTo(gx + (gs * 0.87 * cr - gs * 0.5 * sr), gy + (gs * 0.87 * sr + gs * 0.5 * cr));
        c.lineTo(gx + (-gs * 0.87 * cr - gs * 0.5 * sr), gy + (-gs * 0.87 * sr + gs * 0.5 * cr));
        c.closePath();
        c.stroke();
      }

      c.globalAlpha = 1;
    }

    // Stroking a few thousand triangles is the whole cost of this component, so
    // it runs at ~30fps rather than 60 — the drift is slow enough that the
    // halved frame rate is invisible, and it halves the burn on a page the
    // visitor will scroll straight past.
    const FRAME_MS = 33;
    let last = -Infinity;

    function loop(t: number) {
      if (t - last >= FRAME_MS) {
        render(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    }

    // Paint one frame synchronously rather than waiting on the first rAF:
    // a tab opened in the background (cmd-click, "open in new tab") has rAF
    // throttled off entirely, and would otherwise show a blank canvas until it
    // is focused.
    buildClouds(measure());
    render(performance.now());
    if (!reduced) raf = requestAnimationFrame(loop);

    // Reduced motion still needs the shape to follow the scroll, it just does
    // so without the spin and drift.
    const onScroll = () => { if (reduced) render(performance.now()); };

    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const count = measure();
        if (count !== particleCount) buildClouds(count);
        render(performance.now());
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="constellation"
    />
  );
}
