import { HomeClient } from "./HomeClient";
import { SITE_URL, OG_IMAGE, pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "DriveLink Connect · Private Windshield QR Tag for Vehicle Owners",
  description:
    "Reach any vehicle owner instantly without exposing phone numbers. A secure windshield QR tag that turns parking alerts and emergencies into private two-way chat.",
  path: "/",
  // Force an absolute canonical — pageMetadata resolves '/' → SITE_URL already,
  // but we pass absoluteUrl explicitly so it can never be relativised.
  absoluteUrl: "https://www.drivelink.tech/",
});

/**
 * Single JSON-LD @graph combining the Organization and SoftwareApplication
 * schemas so crawlers receive both in one HTTP/document round-trip.
 */
const graphJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DriveLink Technologies",
      alternateName: "DriveLink Connect",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      description:
        "DriveLink Technologies builds privacy-first vehicle communication tools. DriveLink Connect is a secure windshield QR tag service that lets anyone reach a vehicle owner instantly through an anonymous, end-to-end encrypted chat — without ever revealing phone numbers.",
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
      name: "DriveLink Connect",
      url: SITE_URL,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web, iOS, Android",
      description:
        "A private windshield QR tag that lets passersby reach your vehicle instantly. Scan the tag → open an anonymous two-way chat → notify the owner about parking issues or emergencies — all without exposing either party's phone number.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      image: `${SITE_URL}${OG_IMAGE}`,
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
