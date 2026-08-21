import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import ContactForm from "@/components/site/ContactForm";
import ChatWidget from "@/components/site/ChatWidget";
import Logo from "@/components/site/Logo";
import DotField from "@/components/site/DotField";
import { Reveal, StatCounter, Faq } from "@/components/site/ui";
import { AGENTS, AGENTS_INTRO, BRAND, CAPABILITIES, CLOSING, FAQ, FOOTER_BLURB, HERO, NAV, PROCESS, STATS } from "@/lib/content";

// Section order and surfaces follow the reference site: paper, ink, beige,
// paper, lavender, ink, white, ink. The alternation is what gives the page its
// rhythm — run them all on one surface and it flattens into a single sheet.
export default function Home() {
  return (
    <div className="site">
      <SiteHeader />

      {/* 1 — Hero. Full viewport, centred over the speck field. */}
      <section className="hero">
        <DotField />
        <div className="wrap">
          <Reveal onLoad rotate={0}>
            <h1 className="display" style={{ margin: "0 auto" }}>
              {HERO.headline[0]}
              <br />
              <span className="accent-purple">{HERO.headline[1]}</span>
            </h1>
          </Reveal>
          <Reveal onLoad rotate={0} delay={0.3}>
            <p className="lede" style={{ margin: "28px auto 0" }}>{HERO.body}</p>
          </Reveal>
          <Reveal onLoad mask rotate={0} delay={0.7} style={{ marginTop: 36 }}>
            <div className="hero-actions">
              <a href="#contact" className="pill">{HERO.cta}</a>
              <a href="#what-we-do" className="pill pill-outline">{HERO.secondaryCta}</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — Dark value strip */}
      <section className="s-ink" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
            {HERO.points.map((point, i) => (
              <Reveal key={point} delay={i * 0.08}>
                <h3 className="h-2xs" style={{ margin: 0 }}>{point}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — What we can do for you */}
      <section id="what-we-do" className="s-beige" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="wrap">
          <Reveal>
            <h2 className="h" style={{ margin: "0 0 16px" }}>What we can do for you</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-muted" style={{ margin: "0 0 56px", maxWidth: 620 }}>
              Software, webapps, systems and integrations that interconnect complex operations — built around how
              your operation actually runs, and delivered by engineers embedded in your business.
            </p>
          </Reveal>

          {CAPABILITIES.map((group, gi) => (
            <div key={group.group} style={{ marginTop: gi === 0 ? 0 : 64 }}>
              <Reveal>
                <p className="label" style={{ margin: "0 0 28px" }}>{group.group}</p>
              </Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 40 }}>
                {group.items.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.06}>
                    <h3 className="h-2xs" style={{ margin: "0 0 10px" }}>{item.title}</h3>
                    <p className="body-muted" style={{ margin: 0 }}>{item.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — Agent Stack */}
      <section id="agents" className="s-paper" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="wrap">
          <Reveal>
            <h2 className="h-lg" style={{ margin: "0 0 16px" }}>Agent Stack.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-muted" style={{ margin: "0 0 56px", maxWidth: 620 }}>{AGENTS_INTRO}</p>
          </Reveal>

          <div>
            {AGENTS.map((agent) => (
              <Reveal key={agent.name}>
                <hr className="rule" />
                <div className="agent-row" style={{ display: "grid", gridTemplateColumns: "110px minmax(0, 1fr) minmax(0, 1.5fr)", gap: 28, alignItems: "baseline", padding: "22px 0" }}>
                  <span className="caption" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{agent.category}</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{agent.name}</h3>
                  <p className="body-muted" style={{ margin: 0 }}>{agent.body}</p>
                </div>
              </Reveal>
            ))}
            <hr className="rule" />
          </div>
        </div>
      </section>

      {/* 5 — Lavender band */}
      <section className="s-lavender" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="wrap">
          <Reveal>
            <p className="label" style={{ margin: "0 0 32px" }}>Why {BRAND.name}</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40 }}>
            {STATS.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} prefix={stat.prefix} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* 6 — How we work */}
      <section id="process" className="s-ink" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="wrap">
          <Reveal>
            <h2 className="h" style={{ margin: "0 0 16px" }}>How we work</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="body-muted" style={{ margin: "0 0 56px", maxWidth: 620 }}>
              Four steps, no surprises. Discovery is free and pricing only ever comes out of it — scoped to real,
              tangible ROI.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40 }}>
            {PROCESS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.07}>
                <p className="label" style={{ margin: "0 0 14px" }}>{step.step}</p>
                <h3 className="h-2xs" style={{ margin: "0 0 10px" }}>{step.title}</h3>
                <p className="body-muted" style={{ margin: 0 }}>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Questions */}
      <section id="faq" className="s-white" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="wrap">
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal>
              <h2 className="h-sm" style={{ margin: 0, position: "sticky", top: 110 }}>Questions</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <Faq items={FAQ} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8 — Closing + footer */}
      <section id="contact" className="s-ink" style={{ paddingTop: 90, paddingBottom: 72 }}>
        <div className="wrap">
          <Reveal>
            <p className="label" style={{ margin: "0 0 28px" }}>{CLOSING.tagline}</p>
          </Reveal>
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal delay={0.15}>
              <div>
                <h2 className="h-lg" style={{ margin: 0 }}>{CLOSING.headline}</h2>
                <p className="lede" style={{ margin: "24px 0 32px" }}>{CLOSING.body}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href={`mailto:${BRAND.email}`} className="body-muted">{BRAND.email}</a>
                  <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="body-muted">
                    WhatsApp {BRAND.phone}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <ContactForm />
            </Reveal>
          </div>

          <hr className="rule" style={{ margin: "72px 0 40px" }} />
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 40 }}>
            <div>
              <Logo size={22} dark />
              <p className="body-muted" style={{ margin: "18px 0 0", maxWidth: 420 }}>{FOOTER_BLURB}</p>
            </div>
            <div>
              <p className="caption" style={{ margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Site</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="ghost" style={{ textAlign: "left" }}>{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="caption" style={{ margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={`mailto:${BRAND.email}`} className="body-muted">{BRAND.email}</a>
                <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="body-muted">{BRAND.phone}</a>
                <span className="body-muted">{BRAND.location}</span>
                <Link href="/privacy" className="body-muted" style={{ marginTop: 4 }}>Privacy</Link>
              </div>
            </div>
          </div>
          <p className="caption" style={{ margin: "40px 0 0" }}>© {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}</p>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}
