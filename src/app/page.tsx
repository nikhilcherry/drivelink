import { HomeClient } from "./HomeClient";
import { SITE_URL, pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "DriveLink · The Communication Backbone for Automotive AI",
  description: "DriveLink adds the missing V2V communication layer to modern vehicles — a low-latency, intent-first protocol connecting OEMs, fleets, and smart cities.",
  path: "/",
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DriveLink",
  alternateName: "DriveLink V2V",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "DriveLink is a Vehicle-to-Vehicle (V2V) communication protocol that lets cars broadcast intent and predicted trajectory in under 50ms, enabling proactive cooperative driving across OEMs, fleets, and smart cities.",
  founder: [
    { "@type": "Person", name: "Hruday" },
    { "@type": "Person", name: "Nikhil" },
    { "@type": "Person", name: "Krishna" },
  ],
  award: [
    "All India Rank 5 — Pitch Arena National Finals, IIT Delhi (2026)",
    "Patent Grant Option — awarded for originality at a national hackathon",
  ],
  sameAs: [
    "https://github.com/nikhilcherry/drivelink",
    "https://github.com/nikhilcherry/drivelink-sim",
    "https://github.com/nikhilcherry/drivelink_software",
    "https://github.com/nikhilcherry",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DriveLink",
  url: SITE_URL,
  description: "The communication backbone for automotive AI — a V2V intent-sharing protocol.",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
