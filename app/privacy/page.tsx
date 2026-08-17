import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/content";

export const metadata = { title: "Privacy" };

const SECTIONS = [
  {
    title: "What we collect",
    body: "When you submit the contact form or talk to the assistant on this site, we store the name, email, phone, company and message you give us. Nothing else is collected — we do not run advertising trackers or sell data.",
  },
  {
    title: "Why we collect it",
    body: "Solely to reply to you, scope the work you asked about, and follow up on that conversation. If you never hear from us again, that is the only outcome we use it for.",
  },
  {
    title: "Who can see it",
    body: "Our own team, through our backoffice. Messages are delivered through Resend and the site assistant runs on Anthropic's API; both process the content strictly to deliver the service.",
  },
  {
    title: "Your code and your data",
    body: "For client engagements: everything we build lives in your repositories and your infrastructure. Your code, your data, 100% yours — no lock-in, no black boxes.",
  },
  {
    title: "Removing your data",
    body: `Email ${BRAND.email} and we will delete your record. No forms, no retention period, no argument.`,
  },
];

export default function Privacy() {
  return (
    <div className="site">
      <SiteHeader />
      <section style={{ paddingTop: 60 }}>
        <div className="wrap">
          <h1 className="h-lg" style={{ margin: "0 0 60px", maxWidth: 780 }}>Privacy.</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 36, maxWidth: 640 }}>
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="h-2xs" style={{ margin: "0 0 12px" }}>{s.title}</h2>
                <p className="body-muted" style={{ margin: 0, fontSize: 16 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 60 }}>
            <Link href="/" className="ghost">← Back home</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
