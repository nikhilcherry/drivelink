import { HiringClient } from "./HiringClient";
import { pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Join us · DriveLink",
  description:
    "Work on DriveLink's cross-OEM V2V intent protocol — ML, IoT, and R&D roles. Send us your details, links, and resume.",
  path: "/hiring",
});

// No JobPosting JSON-LD on purpose: that schema wants a real datePosted,
// validThrough, and jobLocation per role. Faking those to get a rich result is
// how you earn a structured-data penalty. Add it once actual roles are listed.

export default function HiringRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd("Join us", "/hiring")) }}
      />
      <HiringClient />
    </>
  );
}
