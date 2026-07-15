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
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  founder: [
    { "@type": "Person", name: "Hruday" },
    { "@type": "Person", name: "Nikhil" },
    { "@type": "Person", name: "Krishna" },
  ],
  sameAs: [
    "https://github.com/nikhilcherry/drivelink-sim",
    "https://github.com/nikhilcherry/drivelink_software",
    "https://github.com/nikhilcherry",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
