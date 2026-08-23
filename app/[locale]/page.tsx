import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import ContactForm from "@/components/site/ContactForm";
import ChatWidget from "@/components/site/ChatWidget";
import Logo from "@/components/site/Logo";
import OpsCanvas from "@/components/site/OpsCanvas";
import { Reveal, StatCounter, Faq } from "@/components/site/ui";
import { BRAND, getContent, isLocale } from "@/lib/content";

// Surfaces alternate void → panel → void. The reference has no divider lines:
// a section change is a background change, which is why every band below
// carries an explicit surface class.
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);

  return (
    // lang on the subtree rather than on <html>: the root layout is shared with
    // the backoffice and cannot see this segment's params without opting the
    // whole site out of static rendering.
    <div className="site" lang={locale}>
      <SiteHeader locale={locale} />

      {/* 1 — Hero. Copy left, live graph right. The graph is the argument. */}
      <section className="hero grid-bed">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <Reveal onLoad rotate={0}>
                <span className="chip">{c.hero.status}</span>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.12}>
                <h1 className="display" style={{ marginTop: 22 }}>
                  {c.hero.headline[0]}
                  <br />
                  {c.hero.headline[1]}
                </h1>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.32}>
                <p className="lede" style={{ marginTop: 24 }}>{c.hero.body}</p>
              </Reveal>
              <Reveal onLoad mask rotate={0} delay={0.6} style={{ marginTop: 32 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <a href="#contact" className="btn btn-signal">{c.hero.cta}</a>
                  <a href="#agents" className="btn btn-ghost">{c.hero.secondaryCta}</a>
                </div>
              </Reveal>
              <Reveal onLoad rotate={0} delay={0.8}>
                <div className="metrics">
                  {c.hero.metrics.map((m) => (
                    <div key={m.label}>
                      <span className="metric-value">{m.value}</span>
                      <span className="metric-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <OpsCanvas core={c.opsCore} nodes={c.opsNodes} />
          </div>
        </div>
      </section>

      {/* 2 — What we build */}
      <section id="what-we-do" className="s-panel">
        <div className="wrap">
          <Reveal>
            <p className="mono" style={{ marginBottom: 18 }}>{c.sections.build.num} / {c.sections.build.label}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="h-lg" style={{ maxWidth: "22ch" }}>{c.sections.build.heading}</h2>
          </Reveal>

          {c.capabilities.map((group, gi) => (
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
            <p className="mono" style={{ marginBottom: 18 }}>{c.sections.agents.num} / {c.sections.agents.label}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="h-lg">{c.sections.agents.heading}</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body-muted" style={{ margin: "18px 0 48px", maxWidth: "62ch" }}>{c.agentsIntro}</p>
          </Reveal>

          <div>
            <hr className="rule" />
            {c.agents.map((agent, i) => (
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
            <p className="mono" style={{ marginBottom: 18 }}>{c.sections.process.num} / {c.sections.process.label}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="h-lg" style={{ maxWidth: "20ch" }}>{c.sections.process.heading}</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))", gap: 20, marginTop: 56 }}>
            {c.process.map((step, i) => (
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
            <p className="mono" style={{ marginBottom: 36 }}>{c.sections.proof.num} / {c.sections.proof.label}</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(196px, 1fr))", gap: 20 }}>
            {c.stats.map((stat) => (
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
                <p className="mono" style={{ marginBottom: 18 }}>{c.sections.faq.num} / {c.sections.faq.label}</p>
                <h2 className="h-sm">{c.sections.faq.heading}</h2>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Faq items={c.faq} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7 — Closing + footer */}
      <section id="contact" className="s-panel" style={{ paddingBottom: 64 }}>
        <div className="wrap">
          <Reveal>
            <p className="mono mono-signal" style={{ marginBottom: 28 }}>{c.closing.tagline}</p>
          </Reveal>
          <div className="two-col" style={{ alignItems: "start" }}>
            <Reveal delay={0.15}>
              <div>
                <h2 className="h-lg">{c.closing.headline}</h2>
                <p className="lede" style={{ margin: "22px 0 30px" }}>{c.closing.body}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href={`mailto:${BRAND.email}`} className="link-current">{BRAND.email}</a>
                  <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="link-current">
                    WhatsApp {BRAND.phone}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <ContactForm copy={c.form} />
            </Reveal>
          </div>

          <hr className="rule" style={{ margin: "72px 0 40px" }} />
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 40 }}>
            <div>
              <Logo size={22} dark />
              <p className="body-muted" style={{ margin: "18px 0 0", maxWidth: 420 }}>{c.footerBlurb}</p>
            </div>
            <div>
              <p className="mono" style={{ marginBottom: 14 }}>{c.footer.site}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {c.nav.map((item) => (
                  <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="mono" style={{ marginBottom: 14 }}>{c.footer.contact}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={`mailto:${BRAND.email}`} className="nav-link">{BRAND.email}</a>
                <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="nav-link">{BRAND.phone}</a>
                <span className="body-muted">{BRAND.location}</span>
                <Link href={`/${locale}/privacy`} className="nav-link" style={{ marginTop: 4 }}>{c.footer.privacy}</Link>
              </div>
            </div>
          </div>
          <p className="caption" style={{ marginTop: 40 }}>© {new Date().getFullYear()} {BRAND.name} — {c.tagline}</p>
        </div>
      </section>

      <ChatWidget locale={locale} />
    </div>
  );
}
