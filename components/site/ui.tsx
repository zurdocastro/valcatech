"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Motion spec lifted from the reference implementation (dala.craftedbygc.com,
// theme.js). Its "splitTextRotateIn" preset is what gives the design its
// character: headlines and body copy are split into lines, each line masked by
// an overflow:hidden parent, and the lines swing up from below with a slight
// rotation pivoting off their top-left corner.
const TEXT = {
  yPercent: 120,
  transformOrigin: "0 0",
  duration: 0.8,
  ease: "power3.out",
  stagger: { each: 0.1, ease: "power1.in" },
};

// Non-text blocks (forms, icon rows) get the lighter element reveal.
const BLOCK = { y: 40, autoAlpha: 0, duration: 1, ease: "expo.out" };

// CTAs use the masked slide the reference applies to its buttons.
const MASKED = { yPercent: 120, rotate: 2, duration: 1, ease: "expo.out" };

const TEXT_SELECTOR = "h1, h2, h3, p, li, .label, .caption";

// `start: "top bottom"` fires the moment the element's top crosses the viewport
// bottom, matching the reference. ScrollTrigger also settles anything already
// scrolled past into its end state, so landing on an anchor (/#contact) never
// leaves the sections above it stuck invisible.
const TRIGGER = { start: "top bottom", once: true };

export function Reveal({
  children, delay = 0, as: Tag = "div", className = "", style, mask = false, rotate = 7, onLoad = false,
}: {
  children: React.ReactNode;
  /** Seconds, matching the reference's own delay values. */
  delay?: number;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  /** Masked slide-up, for CTAs. */
  mask?: boolean;
  /** Degrees of swing on the text lines — the reference uses 0, 7 or 14. */
  rotate?: number;
  /** Above-the-fold content plays on load instead of waiting for a scroll. */
  onLoad?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Reduced motion still has to reveal the content — it just appears.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrollTrigger = onLoad ? undefined : { trigger: el, ...TRIGGER };

        if (mask) {
          gsap.set(el, { autoAlpha: 1, overflow: "hidden" });
          gsap.from(el.children, { ...MASKED, delay, scrollTrigger });
          return;
        }

        const targets = el.querySelectorAll<HTMLElement>(TEXT_SELECTOR);
        if (targets.length === 0) {
          gsap.set(el, { autoAlpha: 1 });
          gsap.from(el, { ...BLOCK, delay, scrollTrigger });
          return;
        }

        // SplitText measures line boxes, so it has to wait for the real font —
        // splitting against the fallback puts the breaks in the wrong places
        // and the lines re-flow visibly once Inter arrives. The font promise can
        // land after the component is gone, so the cleanup flag stops it from
        // splitting a detached tree (and leaving it permanently hidden).
        let cancelled = false;
        cleanups.push(() => { cancelled = true; });
        document.fonts.ready.then(() => {
          if (cancelled) return;
          try {
            SplitText.create(targets, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, { ...TEXT, rotate, delay, scrollTrigger }),
            });
          } catch (err) {
            // A split failure must never cost the visitor the copy itself —
            // the `finally` below reveals the block either way.
            console.error("SplitText failed, showing text unanimated:", err);
          } finally {
            gsap.set(el, { autoAlpha: 1 });
          }
        });
      });
    }, ref);

    return () => {
      for (const fn of cleanups) fn();
      ctx.revert();
    };
  }, [delay, mask, rotate, onLoad]);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}

// Slow scrub-linked drift, the reference's treatment for large visuals.
export function Parallax({ children, distance = "-5vw", className = "", style, ...rest }: {
  children: React.ReactNode; distance?: string; className?: string; style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
        gsap.from(el, {
          y: distance,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [distance]);

  return <div ref={ref} className={className} style={style} {...rest}>{children}</div>;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      // The huge top margin counts "already scrolled past" as intersecting, so
      // an anchor jump can't leave a counter frozen at zero.
      { threshold: 0.15, rootMargin: "9999px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

export function StatCounter({ value, prefix = "", suffix = "", label }: { value: number; prefix?: string; suffix?: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(value); return; }
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: value,
      duration: 1.4,
      ease: "expo.out",
      onUpdate: () => setN(Math.round(counter.val)),
    });
    return () => { tween.kill(); };
  }, [inView, value]);

  return (
    <div ref={ref}>
      <div className="stat-value">{prefix}{n}{suffix}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.q}>
          <hr className="rule" />
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="faq-q"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, background: "none", border: "none", padding: "30px 0", cursor: "pointer", textAlign: "left" }}
          >
            <span className="h-2xs" style={{ color: open === i ? "var(--t-hi)" : "var(--t-mute)" }}>{item.q}</span>
            <span aria-hidden className="faq-plus" style={{ flexShrink: 0, color: "var(--signal)", fontSize: 24, lineHeight: 1, transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
          </button>
          <div style={{ display: "grid", gridTemplateRows: open === i ? "1fr" : "0fr", transition: "grid-template-rows .6s cubic-bezier(.19,1,.22,1)" }}>
            <div style={{ overflow: "hidden" }}>
              <p className="body-muted" style={{ margin: 0, paddingBottom: 30, maxWidth: 640 }}>{item.a}</p>
            </div>
          </div>
        </div>
      ))}
      <hr className="rule" />
    </div>
  );
}
