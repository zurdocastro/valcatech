import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter substitutes for geomanist. Weight 300 is load-bearing: the reference
// sets 48–82px display type at 300, so headlines carry by size, not thickness.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

// Technical data only — node labels, metrics, terminal output. Never prose.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-real",
  display: "swap",
});

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://valcatech.com").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VALCA Tech — AI Solutions Firm",
    template: "%s | VALCA Tech",
  },
  description:
    "Custom software and AI agents — webapps, systems and integrations that interconnect complex operations. Born in Costa Rica, working from the USA to Argentina. Your code, your data.",
  openGraph: {
    title: "VALCA Tech — AI Solutions Firm",
    description: "Custom software and AI agents that interconnect complex operations. Value in weeks, not months.",
    url: BASE_URL,
    siteName: "VALCA Tech",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e0918",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
