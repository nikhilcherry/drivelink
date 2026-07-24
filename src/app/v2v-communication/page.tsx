import { V2VClient } from "./V2VClient";
import { SITE_URL, pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "What is V2V (Vehicle-to-Vehicle) Communication? · DriveLink",
  description:
    "A plain-English explainer of V2V communication — how it works, DSRC vs C-V2X vs intent-first protocols, why sub-50ms latency matters, and how DriveLink implements it.",
  path: "/v2v-communication",
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What is V2V (Vehicle-to-Vehicle) Communication?",
  description:
    "How vehicle-to-vehicle communication works, how it differs from DSRC and C-V2X, why latency matters, and how DriveLink implements an intent-first V2V protocol.",
  url: `${SITE_URL}/v2v-communication`,
  author: { "@type": "Organization", name: "DriveLink", url: SITE_URL },
  publisher: { "@type": "Organization", name: "DriveLink", url: SITE_URL },
  mainEntityOfPage: `${SITE_URL}/v2v-communication`,
};

const definedTermJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "V2V Communication",
  alternateName: "Vehicle-to-Vehicle Communication",
  description:
    "A technology that lets vehicles exchange position, speed, and predicted intent directly with one another for cooperative, proactive driving.",
  inDefinedTermSet: `${SITE_URL}/v2v-communication`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is DriveLink?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DriveLink is a Vehicle-to-Vehicle (V2V) communication protocol and company building the missing intent-sharing layer for modern vehicles — a low-latency, intent-first standard designed to work across OEMs, fleets, and smart-city programs.",
      },
    },
    {
      "@type": "Question",
      name: "Is V2V communication the same as autonomous driving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Autonomous driving is about a single vehicle making its own decisions; V2V communication is about vehicles sharing information so every vehicle on the road can make better decisions. V2V is complementary infrastructure, not a replacement for onboard perception or autonomy stacks.",
      },
    },
    {
      "@type": "Question",
      name: "Does V2V communication require every car to have the same hardware?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not with a cross-OEM protocol. An open, intent-first standard like DriveLink's lets any manufacturer, aftermarket module, or fleet-management system implement the same message format, the same way Wi-Fi or Bluetooth work across unrelated hardware vendors.",
      },
    },
  ],
};

export default function V2VCommunicationRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd("What is V2V Communication?", "/v2v-communication")) }}
      />
      <V2VClient />
    </>
  );
}
