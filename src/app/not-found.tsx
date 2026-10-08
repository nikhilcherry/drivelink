import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Page not found · DriveLink",
    description: "That page doesn't exist on drivelink.tech.",
    path: "/404",
  }),
  // A 404 has nothing to index and no canonical of its own.
  alternates: undefined,
  robots: { index: false, follow: true },
};

const links = [
  { href: "/", label: "Home", body: "The V2V backbone, the concept simulation, and the origin story." },
  { href: "/product", label: "Product", body: "The three-layer system and the in-browser traffic model." },
  { href: "/v2v-communication", label: "What is V2V?", body: "Plain-English explainer — DSRC, C-V2X, and where we sit." },
  { href: "/team", label: "Team", body: "The founders, the core team, and the mentors." },
  { href: "/hiring", label: "Join us", body: "Open focus areas and a two-minute application." },
];

export default function NotFound() {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 170, paddingBottom: 90 }}>
        <div className="dlw-container" style={{ maxWidth: 820 }}>
          <div className="dlw-section-head">
            <div className="dlw-eyebrow"><span className="num">404</span> Link lost</div>
            <h1 className="dlw-section-title" style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)" }}>
              This node isn&apos;t <span className="dlw-text-gradient">on the mesh.</span>
            </h1>
            <p className="dlw-section-sub">
              The page you asked for doesn&apos;t exist — moved, mistyped, or never built. Here is everything that does.
            </p>
          </div>

          <div className="dlw-404-grid">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="dlw-404-card">
                <span className="k">{l.label}</span>
                <span className="v">{l.body}</span>
              </Link>
            ))}
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
