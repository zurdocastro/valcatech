import Link from "next/link";
import Constellation from "@/components/site/Constellation";
import SiteHeader from "@/components/site/SiteHeader";
import ContactForm from "@/components/site/ContactForm";
import ChatWidget from "@/components/site/ChatWidget";
import Logo from "@/components/site/Logo";
import { Reveal, StatCounter, Faq } from "@/components/site/ui";
import { AGENTS, AGENTS_INTRO, BRAND, CAPABILITIES, CLOSING, FAQ, FOOTER_BLURB, HERO, NAV, PROCESS, STATS } from "@/lib/content";

export default function Home() {
  return (
    <div className="site">
      <Constellation />
      <SiteHeader />

      {/* Hero — oversized headline left; the right half is the fixed particle
          layer showing through from behind the content. */}
      <section style={{ paddingTop: 30, paddingBottom: 60 }}>
        <div className="wrap">
          <div className="two-col" data-orb="right" data-shape="brain" style={{ alignItems: "center", minHeight: "min(78vh, 720px)" }}>
            <div>
              <Reveal onLoad rotate={0}>
                <p className="label" style={{ margin: "0 0 24px" }}>{HERO.label}</p>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.2}>
                <h1 className="display" style={{ margin: 0 }}>
                  {HERO.headline[0]}
                  <br />
                  {HERO.headline[1]}
                </h1>
              </Reveal>
              <Reveal onLoad delay={0.5}>
                <p className="lede" style={{ margin: "30px 0 0" }}>{HERO.body}</p>
              </Reveal>
              <Reveal onLoad mask delay={1.5} style={{ marginTop: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap" }}>
                  <a href="#contact" className="pill">{HERO.cta}</a>
                  <a href="#what-we-do" className="ghost">{HERO.secondaryCta} →</a>
                </div>
              </Reveal>
              <Reveal onLoad delay={1}>
                <ul style={{ listStyle: "none", margin: "60px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {HERO.points.map((point) => (
                    <li key={point} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--silver-mist)", fontSize: 15, fontWeight: 200 }}>
                      <span aria-hidden style={{ color: "var(--saffron)" }}>▲</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section id="what-we-do">
        <div className="wrap">
          <div className="two-col" data-orb="left" data-shape="scatter" style={{ marginBottom: 96, minHeight: "min(60vh, 520px)", alignItems: "center" }}>
            <div aria-hidden />
            <div>
              <Reveal>
                <h2 className="h-lg" style={{ margin: "0 0 30px" }}>What we build.</h2>
              </Reveal>
              <Reveal delay={0.5}>
                <div>
                  <p className="label" style={{ margin: "0 0 18px" }}>Custom software</p>
                  <p className="body-muted" style={{ margin: 0, maxWidth: 520 }}>
                    Software, webapps, systems and integrations that interconnect complex operations — built around how
                    your operation actually runs, and delivered by engineers embedded in your business.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {CAPABILITIES.map((group, gi) => (
            <div key={group.group} style={{ marginTop: gi === 0 ? 0 : 96 }}>
              <Reveal>
                <p className="label" style={{ margin: "0 0 36px" }}>{group.group}</p>
              </Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 60 }}>
                {group.items.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.07}>
                    <h3 className="h-2xs" style={{ margin: "0 0 12px" }}>{item.title}</h3>
                    <p className="body-muted" style={{ margin: 0, fontSize: 16 }}>{item.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent stack */}
      <section id="agents">
        <div className="wrap">
          <div className="two-col" data-orb="left" data-shape="bulb" style={{ marginBottom: 96, minHeight: "min(60vh, 520px)", alignItems: "center" }}>
            <div aria-hidden />
            <div>
              <Reveal>
                <div>
                  <p className="label" style={{ margin: "0 0 24px" }}>The agent stack</p>
                  <h2 className="h-lg" style={{ margin: "0 0 30px" }}>One agent per real problem.</h2>
                </div>
              </Reveal>
              <Reveal delay={0.5}>
                <p className="body-muted" style={{ margin: 0, maxWidth: 520 }}>{AGENTS_INTRO}</p>
              </Reveal>
            </div>
          </div>

          <div>
            {AGENTS.map((agent, i) => (
              <Reveal key={agent.name} delay={0}>
                <hr className="rule" />
                <div className="agent-row" style={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr) minmax(0, 1.4fr)", gap: 30, alignItems: "baseline", padding: "30px 0" }}>
                  <span className="caption" style={{ color: "var(--iris)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{agent.category}</span>
                  <h3 className="h-2xs" style={{ margin: 0 }}>{agent.name}</h3>
                  <p className="body-muted" style={{ margin: 0, fontSize: 16 }}>{agent.body}</p>
                </div>
              </Reveal>
            ))}
            <hr className="rule" />
          </div>
        </div>
      </section>

      {/* Why VALCA */}
      <section>
        <div className="wrap">
          <div className="two-col" data-orb="left" data-shape="scatter" style={{ minHeight: "min(60vh, 520px)", alignItems: "center" }}>
            <div aria-hidden />
            <div>
              <Reveal>
                <h2 className="h-lg" style={{ margin: "0 0 60px" }}>Why {BRAND.name}.</h2>
              </Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 36 }}>
                {STATS.map((stat) => (
                  <StatCounter key={stat.label} value={stat.value} prefix={stat.prefix} suffix={stat.suffix} label={stat.label} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process">
        <div className="wrap">
          <div className="two-col" style={{ marginBottom: 96 }}>
            <Reveal>
              <h2 className="h-lg" style={{ margin: 0 }}>How we work.</h2>
            </Reveal>
            <Reveal delay={0.5}>
              <p className="body-muted" style={{ margin: 0, maxWidth: 520 }}>
                Four steps, no surprises. Discovery is free and pricing only ever comes out of it — scoped to real,
                tangible ROI.
              </p>
            </Reveal>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 60 }}>
            {PROCESS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.08}>
                <p className="label" style={{ margin: "0 0 18px", color: "var(--iris)" }}>{step.step}</p>
                <h3 className="h-2xs" style={{ margin: "0 0 12px" }}>{step.title}</h3>
                <p className="body-muted" style={{ margin: 0, fontSize: 16 }}>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="wrap">
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal>
              <h2 className="h-lg" style={{ margin: 0, position: "sticky", top: 120 }}>Questions.</h2>
            </Reveal>
            <Reveal delay={0.5}>
              <Faq items={FAQ} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="contact">
        <div className="wrap">
          <Reveal>
            <p className="label" style={{ margin: "0 0 36px" }}>{CLOSING.tagline}</p>
          </Reveal>
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal delay={0.5}>
              <div>
                <h2 className="display" style={{ margin: 0 }}>{CLOSING.headline}</h2>
                <p className="lede" style={{ margin: "30px 0 36px" }}>{CLOSING.body}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <a href={`mailto:${BRAND.email}`} className="body-muted" style={{ fontSize: 16 }}>{BRAND.email}</a>
                  <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="body-muted" style={{ fontSize: 16 }}>
                    WhatsApp {BRAND.phone}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.8}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "60px 0 60px" }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: 60 }} />
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 60 }}>
            <div>
              <Logo size={24} dark />
              <p className="body-muted" style={{ margin: "24px 0 0", fontSize: 15, maxWidth: 420 }}>{FOOTER_BLURB}</p>
            </div>
            <div>
              <p className="caption" style={{ margin: "0 0 18px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Site</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="ghost" style={{ textAlign: "left" }}>{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="caption" style={{ margin: "0 0 18px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--ash-gray)", fontSize: 14 }}>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
                <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">{BRAND.phone}</a>
                <span>{BRAND.location}</span>
                <Link href="/privacy" style={{ marginTop: 6 }}>Privacy</Link>
              </div>
            </div>
          </div>
          <p className="caption" style={{ margin: "60px 0 0" }}>© {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
