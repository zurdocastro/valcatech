"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/site/Logo";
import { NAV } from "@/lib/content";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  // The nav sits directly on the void with no backdrop, so once the page has
  // scrolled the black fill is what keeps the links legible over content.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 60, background: scrolled ? "#000" : "transparent", transition: "background .2s ease" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 84, gap: 24 }}>
        <Link href="/" aria-label="VALCA Tech home"><Logo size={26} dark /></Link>

        <nav className="valca-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
          ))}
          <a href="#contact" className="pill">Start a project</a>
        </nav>

        <button
          className="valca-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          style={{ display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div style={{ background: "#000", padding: "12px 0 36px" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="nav-link" onClick={() => setOpen(false)}>{item.label}</a>
            ))}
            <a href="#contact" className="pill" style={{ alignSelf: "flex-start" }} onClick={() => setOpen(false)}>Start a project</a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .valca-desktop-nav { display: none !important; }
          .valca-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
