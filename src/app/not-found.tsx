import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Page not found · DriveLink Connect",
    description: "The page you're looking for doesn't exist on drivelink.tech.",
    path: "/404",
  }),
  // A 404 has nothing to index and no canonical of its own.
  alternates: undefined,
  robots: { index: false, follow: true },
};

interface NotFoundLink {
  href: string;
  label: string;
  body: string;
  isExternal?: boolean;
}

const links: NotFoundLink[] = [
  { href: "/", label: "Home", body: "Windshield QR tag product overview and demo." },
  { href: "/#how-connect-works", label: "How It Works", body: "Step-by-step private vehicle contact flow." },
  { href: "/team", label: "Team", body: "The founders, team, and mentors." },
  { href: "/hiring", label: "Hiring", body: "Open roles and joining DriveLink." },
  { href: "mailto:tech.drivelink@gmail.com", label: "Contact", body: "Reach out for support or tag inquiries.", isExternal: true },
];

export default function NotFound() {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 170, paddingBottom: 90 }}>
        <div className="dlw-container" style={{ maxWidth: 820 }}>
          <div className="dlw-section-head">
            <div className="dlw-eyebrow"><span className="num">404</span> Page not found</div>
            <h1 className="dlw-section-title" style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)" }}>
              Page <span className="dlw-text-gradient">not found.</span>
            </h1>
            <p className="dlw-section-sub">
              The page you&apos;re looking for doesn&apos;t exist or has moved. Here are helpful links to get you back on track.
            </p>
          </div>

          <div className="dlw-404-grid">
            {links.map((l) =>
              l.isExternal ? (
                <a key={l.href} href={l.href} className="dlw-404-card">
                  <span className="k">{l.label}</span>
                  <span className="v">{l.body}</span>
                </a>
              ) : (
                <Link key={l.href} href={l.href} className="dlw-404-card">
                  <span className="k">{l.label}</span>
                  <span className="v">{l.body}</span>
                </Link>
              )
            )}
          </div>

          <p style={{ marginTop: 36, fontSize: 14, color: "var(--fg3)" }}>
            Think this page should exist?{" "}
            <a href="mailto:tech.drivelink@gmail.com?subject=Broken%20link%20on%20drivelink.tech" style={{ color: "var(--drive-blue)", fontWeight: 600 }}>
              Tell us which link sent you here.
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
