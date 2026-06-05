import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "../components/Nav";
import { Footer } from "../components/layout/Footer";
import { ScrollProgress } from "../components/anim/ScrollProgress";

export const metadata: Metadata = {
  title: "DriveLink · The Decentralized Backbone for Automotive AI",
  description: "DriveLink adds the missing V2V communication layer to modern vehicles — a low-latency, intent-first protocol connecting OEMs, fleets, and smart cities.",
  keywords: ["V2V", "vehicle communication", "automotive AI", "DriveLink", "intent-first protocol"],
  openGraph: {
    title: "DriveLink · The Decentralized Backbone for Automotive AI",
    description: "V2V communication OS. Intent-first. Sub-50ms. Cross-OEM.",
    url: "https://drivelink.tech",
    siteName: "DriveLink",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
          <ScrollProgress />
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
