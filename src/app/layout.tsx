import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Nav } from "../components/Nav";
import { Footer } from "../components/layout/Footer";
import { ScrollProgress } from "../components/anim/ScrollProgress";
import { RevealOnScroll } from "../components/anim/RevealOnScroll";
import { PointerFX } from "../components/anim/PointerFX";
import { SITE_URL, OG_IMAGE, SITE_NAME } from "../lib/seo";
import { Chatbot } from "../components/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DriveLink · The Communication Backbone for Automotive AI",
  description: "DriveLink adds the missing V2V communication layer to modern vehicles — a low-latency, intent-first protocol connecting OEMs, fleets, and smart cities.",
  keywords: ["V2V", "vehicle communication", "automotive AI", "DriveLink", "intent-first protocol"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "DriveLink · The Communication Backbone for Automotive AI",
    description: "V2V communication OS. Intent-first. Sub-50ms. Cross-OEM.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "DriveLink — Sub-50ms V2V intent protocol" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveLink · The Communication Backbone for Automotive AI",
    description: "V2V communication OS. Intent-first. Sub-50ms. Cross-OEM.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <div className="dlw-page" style={{ minHeight: "100vh" }}>
          <ScrollProgress />
          <RevealOnScroll />
          <PointerFX />
          <Nav />
          {children}
          <Footer />
          <Chatbot />
        </div>
      </body>
    </html>
  );
}
