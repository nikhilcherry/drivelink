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
  title: "DriveLink · V2V Communication Backbone for Automotive AI",
  description: "DriveLink adds the missing V2V communication layer to modern vehicles — a low-latency, intent-first protocol connecting OEMs, fleets, and smart cities.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DriveLink · V2V Communication Backbone for Automotive AI",
    description: "V2V communication OS. Intent-first. Sub-50ms. Cross-OEM.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "DriveLink — Sub-50ms V2V intent protocol" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveLink · V2V Communication Backbone for Automotive AI",
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
      <head>
        {/* The reveal classes ship hidden in the HTML and are shown by an
            IntersectionObserver. Without JS there is no observer, so the
            content would stay at opacity 0 — this makes it simply visible. */}
        <noscript>
          <style>{'.dlw-reveal,.dlw-anim{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body>
        <div className="dlw-page" style={{ minHeight: "100vh" }}>
          <ScrollProgress />
          <RevealOnScroll />
          <PointerFX />
          <a className="dlw-skip-link" href="#main-content">Skip to content</a>
          <Nav />
          {/* Skip-link target. tabIndex -1 so focus actually lands here rather
              than staying on the link and reading the nav again. */}
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <Footer />
          <Chatbot />
        </div>
      </body>
    </html>
  );
}
