import { HomeClient } from "./HomeClient";
import { SITE_URL, OG_IMAGE, pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "DriveLink · V2V Communication Backbone for Automotive AI",
  description:
    "DriveLink adds the missing V2V communication layer to modern vehicles — a low-latency, intent-first protocol connecting OEMs, fleets, and smart cities.",
  path: "/",
  // Force an absolute canonical — pageMetadata resolves '/' → SITE_URL already,
  // but we pass absoluteUrl explicitly so it can never be relativised.
  absoluteUrl: "https://www.drivelink.tech/",
});

/**
 * Single JSON-LD @graph combining Organization, SoftwareApplication, and WebSite
 * schemas so crawlers and rich search engines receive structured entities in one payload.
 */
const graphJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DriveLink Technologies",
      alternateName: "DriveLink",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
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
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "DriveLink V2V Protocol",
      url: SITE_URL,
      applicationCategory: "AutomotiveApplication",
      operatingSystem: "Embedded, Linux, Cross-platform",
      description:
        "A low-latency, intent-first Vehicle-to-Vehicle (V2V) communication protocol broadcasting predicted trajectory and intent between vehicles in under 50ms.",
      image: `${SITE_URL}${OG_IMAGE}`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "DriveLink",
      url: SITE_URL,
      description:
        "The communication backbone for automotive AI — a V2V intent-sharing protocol.",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
