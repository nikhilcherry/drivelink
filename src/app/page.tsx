import { HomeClient } from "./HomeClient";
import { SITE_URL, OG_IMAGE, pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "DriveLink Connect · Smart Vehicle QR Tag for Anonymous Parking Alerts | Contact Car Owner",
  description:
    "Contact car owners instantly with DriveLink Connect smart vehicle QR tag. Receive anonymous parking alerts and emergency notifications via private two-way chat without exposing phone numbers.",
  path: "/",
  // Force an absolute canonical — pageMetadata resolves '/' → SITE_URL already,
  // but we pass absoluteUrl explicitly so it can never be relativised.
  absoluteUrl: "https://www.drivelink.tech/",
});

/**
 * Single JSON-LD @graph combining Organization, SoftwareApplication, and FAQPage
 * schemas so crawlers and rich search engines receive structured entities in one payload.
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
        "DriveLink Technologies builds privacy-first vehicle communication tools. DriveLink Connect is a smart vehicle QR tag service that lets anyone contact a car owner instantly through an anonymous, end-to-end encrypted chat without sharing phone numbers.",
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
        "A smart vehicle QR tag for private windshield contact. Scan the tag to open an instant browser chat, send anonymous parking alerts, or resolve vehicle issues without exposing either party's phone number.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      image: `${SITE_URL}${OG_IMAGE}`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I contact a car owner without their phone number?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DriveLink Connect allows anyone to scan the windshield QR tag using their phone camera to open an instant, anonymous web chat without revealing phone numbers on either side.",
          },
        },
        {
          "@type": "Question",
          name: "Does the person scanning need an app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No app is required to scan. It opens natively in any mobile browser on iOS and Android.",
          },
        },
        {
          "@type": "Question",
          name: "Is the windshield tag weatherproof?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, DriveLink tags use automotive-grade vinyl resistant to rain, intense UV sunlight, and windshield heat.",
          },
        },
      ],
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
