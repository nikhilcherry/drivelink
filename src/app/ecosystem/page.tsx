import { EcosystemClient } from "./EcosystemClient";
import { SITE_URL, pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Ecosystem · DriveLink V2V & V2I Protocols, App & Web Suite",
  description:
    "Explore the complete DriveLink technology ecosystem: V2V intent mesh (drv-mesh), V2I smart infrastructure (drv-infra), in-cabin mobile app SDKs, and cloud fleet visualizers.",
  path: "/ecosystem",
});

const ecosystemJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "DriveLink Connected Vehicle & Infrastructure Ecosystem",
  description:
    "Full-stack architecture covering the DriveLink V2V intent protocol, V2I municipal infrastructure sync, cross-platform mobile driver HUDs, and real-time cloud fleet management.",
  url: `${SITE_URL}/ecosystem`,
  author: {
    "@type": "Organization",
    name: "DriveLink Technologies",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "DriveLink Technologies",
    url: SITE_URL,
  },
};

export default function EcosystemRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ecosystemJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd("Ecosystem", "/ecosystem")),
        }}
      />
      <EcosystemClient />
    </>
  );
}
