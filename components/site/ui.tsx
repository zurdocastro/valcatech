"use client";
import { useEffect, useRef, useState } from "react";

// One shared IntersectionObserver hook behind every scroll-triggered island on
// the marketing page — reveal, stat counters and section headers all key off
// the same "has this entered the viewport" signal.
function useInView<T extends HTMLElement>(once = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      // The huge top margin makes "already scrolled past" count as intersecting.
      // Without it, landing on an anchor (/#contact) jumps everything above the
      // target straight from below-the-viewport to above it without ever
      // crossing the threshold — no callback fires, and those sections stay at
      // opacity 0 as permanently blank content. The -40px bottom keeps the
      // reveal-as-you-scroll-down behavior unchanged.
      { threshold: 0.15, rootMargin: "9999px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return { ref, inView };
}

export function Reveal({ children, delay = 0, as: Tag = "div", className = "", style }: {
  children: React.ReactNode; delay?: number; as?: React.ElementType; className?: string; style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}

export function StatCounter({ value, prefix = "", suffix = "", label }: { value: number; prefix?: string; suffix?: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(value); return; }
    const start = performance.now();
    const duration = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div ref={ref}>
      <div className="h-sm" style={{ color: "var(--bone-white)" }}>{prefix}{n}{suffix}</div>
      <div className="body-muted" style={{ marginTop: 6 }}>{label}</div>
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
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, background: "none", border: "none", padding: "30px 0", cursor: "pointer", textAlign: "left" }}
          >
            <span className="h-2xs" style={{ color: open === i ? "var(--bone-white)" : "var(--ash-gray)", transition: "color .2s ease" }}>{item.q}</span>
            <span aria-hidden style={{ flexShrink: 0, color: "var(--iris)", fontSize: 26, lineHeight: 1, transform: open === i ? "rotate(45deg)" : "none", transition: "transform .22s ease" }}>+</span>
          </button>
          <div style={{ display: "grid", gridTemplateRows: open === i ? "1fr" : "0fr", transition: "grid-template-rows .28s ease" }}>
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
