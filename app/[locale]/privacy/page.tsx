import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import { getContent, isLocale, LOCALES } from "@/lib/content";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getContent(locale).privacy.title.replace(".", "") : "Privacy" };
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);

  return (
    <div className="site" lang={locale}>
      <SiteHeader locale={locale} />
      <section className="s-void" style={{ paddingTop: 60 }}>
        <div className="wrap">
          <h1 className="h-lg" style={{ margin: "0 0 60px", maxWidth: 780 }}>{c.privacy.title}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 36, maxWidth: 640 }}>
            {c.privacy.sections.map((s) => (
              <div key={s.title}>
                <h2 className="h-2xs" style={{ margin: "0 0 12px" }}>{s.title}</h2>
                <p className="body-muted" style={{ margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 60 }}>
            <Link href={`/${locale}`} className="link-current">{c.privacy.back}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
