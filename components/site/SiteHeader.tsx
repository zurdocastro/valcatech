"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "@/components/site/Logo";
import { getContent, LOCALES, swapLocalePath, type Locale } from "@/lib/content";

export default function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || `/${locale}`;
  const c = getContent(locale);

  // The root layout is shared with the backoffice, so it cannot read this
  // segment's locale without opting the whole site out of static rendering.
  // The .site subtree already carries the right lang for assistive tech; this
  // corrects the document attribute too, once hydrated.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // The nav sits directly on the void with no backdrop, so once the page has
  // scrolled a translucent fill is what keeps the links legible over content.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const langSwitch = (
    <div className="lang-switch" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={swapLocalePath(pathname, l)}
          className={`lang-opt${l === locale ? " is-active" : ""}`}
          aria-current={l === locale ? "true" : undefined}
          hrefLang={l}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: scrolled ? "rgba(14,9,24,.86)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--edge)" : "transparent"}`,
        transition: "background .2s ease",
      }}
    >
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 66, gap: 24 }}>
        <Link href={`/${locale}`} aria-label={`${c.tagline} — VALCAS Tech`}><Logo size={24} /></Link>

        <nav className="valca-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {c.nav.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
          ))}
          {langSwitch}
          <a href="#contact" className="btn btn-signal" style={{ padding: "10px 18px", fontSize: 13 }}>{c.hero.cta}</a>
        </nav>

        <button
          className="valca-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={{ display: "none", background: "none", border: "none", color: "var(--t-hi)", cursor: "pointer", padding: 0 }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div style={{ background: "var(--void)", borderBottom: "1px solid var(--edge)", padding: "12px 0 36px" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {c.nav.map((item) => (
              <a key={item.href} href={item.href} className="nav-link" onClick={() => setOpen(false)}>{item.label}</a>
            ))}
            {langSwitch}
            <a href="#contact" className="btn btn-signal" style={{ alignSelf: "flex-start" }} onClick={() => setOpen(false)}>{c.hero.cta}</a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .valca-desktop-nav { display: none !important; }
          .valca-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
