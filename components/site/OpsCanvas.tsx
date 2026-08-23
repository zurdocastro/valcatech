"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { CORE, NODE, POS, VB, edgePath } from "@/lib/ops-graph";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

// Cropped to the graph's real extent — a 600x520 box left dead margin above
// and below, which scaled the whole diagram down inside its column.
type OpsCore = { label: string; sub: string };
type OpsNode = { label: string; sub: string };

export default function OpsCanvas({ core, nodes: opsNodes }: { core: OpsCore; nodes: OpsNode[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const edges = gsap.utils.toArray<SVGPathElement>(".ops-edge");
      const nodes = gsap.utils.toArray<SVGGElement>(".ops-node");
      const pulses = gsap.utils.toArray<SVGCircleElement>(".ops-pulse");

      if (reduced) {
        gsap.set([".ops-core", ...nodes], { opacity: 1, scale: 1 });
        gsap.set(edges, { drawSVG: "100%" });
        gsap.set(pulses, { opacity: 0 });
        return;
      }

      // Entrance: the core lands, its systems appear, then the wiring draws
      // itself between them. Reading order matches the argument.
      const intro = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });

      intro
        .from(".ops-core", { scale: 0.82, opacity: 0, duration: 0.7, ease: "expo.out", transformOrigin: "50% 50%" })
        .from(nodes, { scale: 0.8, opacity: 0, duration: 0.55, ease: "expo.out", stagger: 0.07, transformOrigin: "50% 50%" }, "-=0.35")
        .from(edges, { drawSVG: "0%", duration: 0.8, ease: "power2.inOut", stagger: 0.07 }, "-=0.4")
        // Only once the wiring exists does anything start flowing through it.
        .add(() => {
          pulses.forEach((pulse, i) => {
            const path = edges[i % edges.length];
            // Odd edges run inward, even outward: data in, actions out.
            const inbound = i % 2 === 0;
            gsap.fromTo(
              pulse,
              { opacity: 0 },
              {
                keyframes: [
                  { opacity: 1, duration: 0.18 },
                  { opacity: 1, duration: 1.0 },
                  { opacity: 0, duration: 0.3 },
                ],
                repeat: -1,
                repeatDelay: 1.1,
                delay: i * 0.38,
                ease: "none",
              },
            );
            gsap.to(pulse, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: inbound ? 0 : 1, end: inbound ? 1 : 0 },
              duration: 1.48,
              repeat: -1,
              repeatDelay: 1.1,
              delay: i * 0.38,
              ease: "power1.inOut",
            });
          });
        });

      // Reactive: the graph leans toward the pointer. quickTo keeps this on
      // GSAP's single ticker instead of a tween per mousemove.
      const rx = gsap.quickTo(".ops-stage", "x", { duration: 0.7, ease: "power3.out" });
      const ry = gsap.quickTo(".ops-stage", "y", { duration: 0.7, ease: "power3.out" });
      const rr = gsap.quickTo(".ops-stage", "rotate", { duration: 0.9, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const b = root.getBoundingClientRect();
        const dx = (e.clientX - (b.left + b.width / 2)) / b.width;
        const dy = (e.clientY - (b.top + b.height / 2)) / b.height;
        rx(dx * 26);
        ry(dy * 20);
        rr(dx * 2.4);
      };
      window.addEventListener("pointermove", onMove);

      // Scroll parallax: the graph drifts up as the hero leaves, so the section
      // below arrives over a moving surface rather than a static one.
      gsap.to(".ops-stage", {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });

      return () => window.removeEventListener("pointermove", onMove);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="ops-canvas" ref={rootRef}>
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        role="img"
        aria-label={`${opsNodes.map((n) => n.label).join(", ")} → ${core.label}`}
      >
        <defs>
          <linearGradient id="ops-current" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c66e0" />
            <stop offset="1" stopColor="#b9a6ff" />
          </linearGradient>
        </defs>

        <g className="ops-stage">
          {/* Edges first so nodes always sit on top of their own wiring. */}
          {POS.map((p, i) => (
            <path
              key={`e${i}`}
              className="ops-edge"
              d={edgePath(p.x, p.y)}
              fill="none"
              stroke="url(#ops-current)"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ))}

          {POS.map((p, i) => (
            <circle key={`p${i}`} className="ops-pulse" r="3.4" fill="#b8ff2e" opacity="0" />
          ))}

          {/* Core */}
          <g className="ops-core">
            <rect
              x={CORE.x - CORE.w / 2}
              y={CORE.y - CORE.h / 2}
              width={CORE.w}
              height={CORE.h}
              rx="12"
              fill="#1a1624"
              stroke="rgba(184,255,46,.34)"
            />
            <text x={CORE.x} y={CORE.y - 4} className="ops-core-label" textAnchor="middle">
              {core.label}
            </text>
            <text x={CORE.x} y={CORE.y + 14} className="ops-core-sub" textAnchor="middle">
              {core.sub}
            </text>
            <circle cx={CORE.x - CORE.w / 2} cy={CORE.y} r="3" fill="#b9a6ff" />
            <circle cx={CORE.x + CORE.w / 2} cy={CORE.y} r="3" fill="#b9a6ff" />
          </g>

          {/* Systems */}
          {opsNodes.map((n, i) => {
            const p = POS[i];
            return (
              <g className="ops-node" key={n.label}>
                <rect
                  x={p.x - NODE.w / 2}
                  y={p.y - NODE.h / 2}
                  width={NODE.w}
                  height={NODE.h}
                  rx="10"
                  fill="#1b1728"
                  stroke="#3e3a46"
                />
                <text x={p.x} y={p.y - 2} className="ops-node-label" textAnchor="middle">
                  {n.label}
                </text>
                <text x={p.x} y={p.y + 12} className="ops-node-sub" textAnchor="middle">
                  {n.sub}
                </text>
                {/* Port: where this system's wire physically lands. */}
                <circle
                  cx={p.x + (p.x > CORE.x ? -NODE.w / 2 : NODE.w / 2)}
                  cy={p.y}
                  r="2.6"
                  fill="#b9a6ff"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
