import { ProductClient } from "./ProductClient";
import { SITE_URL, pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Product · DriveLink",
  description: "The DriveLink three-layer system — on-vehicle module, drv-mesh intent protocol, and intelligence layer — plus a live in-browser V2V traffic simulation.",
  path: "/product",
});

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DriveLink V2V Protocol",
  applicationCategory: "Automotive",
  operatingSystem: "Cross-platform, embedded + cloud",
  description:
    "A low-latency, intent-first Vehicle-to-Vehicle (V2V) communication protocol broadcasting predicted trajectory and intent between vehicles in under 50ms.",
  url: `${SITE_URL}/product`,
  isPartOf: { "@type": "Organization", name: "DriveLink", url: SITE_URL },
};

export default function ProductRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd("Product", "/product")) }}
      />
      <ProductClient />
    </>
  );
}
