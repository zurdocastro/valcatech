import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import ContactForm from "@/components/site/ContactForm";
import ChatWidget from "@/components/site/ChatWidget";
import Logo from "@/components/site/Logo";
import OpsCanvas from "@/components/site/OpsCanvas";
import { Reveal, StatCounter, Faq } from "@/components/site/ui";
import { AGENTS, AGENTS_INTRO, BRAND, CAPABILITIES, CLOSING, FAQ, FOOTER_BLURB, HERO, NAV, PROCESS, STATS } from "@/lib/content";

// Surfaces alternate void → panel → void. The reference has no divider lines:
// a section change is a background change, which is why every band below
// carries an explicit surface class.
export default function Home() {
  return (
    <div className="site">
      <SiteHeader />

      {/* 1 — Hero. Copy left, live graph right. The graph is the argument. */}
      <section className="hero grid-bed">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <Reveal onLoad rotate={0}>
                <span className="chip">{HERO.status}</span>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.12}>
                <h1 className="display" style={{ marginTop: 22 }}>
                  {HERO.headline[0]}
                  <br />
                  {HERO.headline[1]}
                </h1>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.32}>
                <p className="lede" style={{ marginTop: 24 }}>{HERO.body}</p>
              </Reveal>
              <Reveal onLoad mask rotate={0} delay={0.6} style={{ marginTop: 32 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <a href="#contact" className="btn btn-signal">{HERO.cta}</a>
                  <a href="#agents" className="btn btn-ghost">{HERO.secondaryCta}</a>
                </div>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.8}>
                <div className="metrics">
                  {HERO.metrics.map((m) => (
                    <div key={m.label}>
                      <span className="metric-value">{m.value}</span>
                      <span className="metric-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <OpsCanvas />
          </div>
        </div>
      </section>

      {/* 2 — What we do */}
      <section id="what-we-do" className="s-panel">
        <div className="wrap">
          <Reveal>
            <p className="mono" style={{ marginBottom: 18 }}>01 / What we build</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="h-lg" style={{ maxWidth: "22ch" }}>Two kinds of work, one operation.</h2>
          </Reveal>

          {CAPABILITIES.map((group, gi) => (
            <div key={group.group} style={{ marginTop: gi === 0 ? 56 : 64 }}>
              <Reveal>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                  <span className="mono mono-signal">{group.group}</span>
                  <hr className="rule" style={{ flex: 1 }} />
                </div>
              </Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(248px, 1fr))", gap: 20 }}>
                {group.items.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.06}>
                    <div className="card" style={{ height: "100%" }}>
                      <h3 className="h-2xs" style={{ marginBottom: 10 }}>{item.title}</h3>
                      <p className="body-muted" style={{ margin: 0 }}>{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — Agent stack */}
      <section id="agents" className="s-void">
        <div className="wrap">
          <Reveal>
            <p className="mono" style={{ marginBottom: 18 }}>02 / The agent stack</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="h-lg">One agent per problem.</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body-muted" style={{ margin: "18px 0 48px", maxWidth: "62ch" }}>{AGENTS_INTRO}</p>
          </Reveal>

          <div>
            <hr className="rule" />
            {AGENTS.map((agent, i) => (
              <Reveal key={agent.name} delay={Math.min(i, 6) * 0.04}>
                <div className="agent-row">
                  <span className="mono">{agent.category}</span>
                  <h3 className="h-2xs">{agent.name}</h3>
                  <p className="body-muted" style={{ margin: 0 }}>{agent.body}</p>
                </div>
                <hr className="rule" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — How we work */}
      <section id="process" className="s-panel">
        <div className="wrap">
          <Reveal>
            <p className="mono" style={{ marginBottom: 18 }}>03 / How we work</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="h-lg" style={{ maxWidth: "20ch" }}>Four steps, no surprises.</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))", gap: 20, marginTop: 56 }}>
            {PROCESS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.07}>
                <div className="card" style={{ height: "100%" }}>
                  <span className="mono mono-signal">{step.step}</span>
                  <h3 className="h-2xs" style={{ margin: "16px 0 10px" }}>{step.title}</h3>
                  <p className="body-muted" style={{ margin: 0 }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Proof */}
      <section className="s-void">
        <div className="wrap">
          <Reveal>
            <p className="mono" style={{ marginBottom: 36 }}>04 / Why {BRAND.name}</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(196px, 1fr))", gap: 20 }}>
            {STATS.map((stat) => (
              <div className="card-lit" key={stat.label}>
                <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Questions */}
      <section id="faq" className="s-void" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal>
              <div style={{ position: "sticky", top: 110 }}>
                <p className="mono" style={{ marginBottom: 18 }}>05 / Questions</p>
                <h2 className="h-sm">Asked before you ask.</h2>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Faq items={FAQ} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7 — Closing + footer */}
      <section id="contact" className="s-panel" style={{ paddingBottom: 64 }}>
        <div className="wrap">
          <Reveal>
            <p className="mono mono-signal" style={{ marginBottom: 28 }}>{CLOSING.tagline}</p>
          </Reveal>
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal delay={0.15}>
              <div>
                <h2 className="h-lg">{CLOSING.headline}</h2>
                <p className="lede" style={{ margin: "22px 0 30px" }}>{CLOSING.body}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href={`mailto:${BRAND.email}`} className="link-current">{BRAND.email}</a>
                  <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="link-current">
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
              <p className="mono" style={{ marginBottom: 14 }}>Site</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="mono" style={{ marginBottom: 14 }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={`mailto:${BRAND.email}`} className="nav-link">{BRAND.email}</a>
                <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="nav-link">{BRAND.phone}</a>
                <span className="body-muted">{BRAND.location}</span>
                <Link href="/privacy" className="nav-link" style={{ marginTop: 4 }}>Privacy</Link>
              </div>
            </div>
          </div>
          <p className="caption" style={{ marginTop: 40 }}>© {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}</p>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}
