import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, getContent, isLocale } from "@/lib/content";
import { notFound } from "next/navigation";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://valcastech.com").replace(/\/$/, "");

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = getContent(locale);
  return {
    title: { absolute: c.meta.title },
    description: c.meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      // hreflang so each language is indexed as its own page rather than as a
      // duplicate of the other.
      languages: Object.fromEntries([
        ...LOCALES.map((l) => [l, `${BASE_URL}/${l}`]),
        ["x-default", `${BASE_URL}/${DEFAULT_LOCALE}`],
      ]),
    },
    openGraph: {
      title: c.meta.title,
      description: c.meta.description,
      url: `${BASE_URL}/${locale}`,
      siteName: "VALCAS Tech",
      locale: locale === "es" ? "es_CR" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}
