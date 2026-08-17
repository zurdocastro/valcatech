import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is the documented substitute for PPNeueMontreal — weight 200 carries
// body copy and 400 carries every headline, per the design system.
const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "600", "700"],
  variable: "--font-display",
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
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
