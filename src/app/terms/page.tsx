import { TermsClient } from "./TermsClient";
import { pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Use · DriveLink",
  description: "The terms covering drivelink.tech — what the site is, how its concept simulations and design-target figures should be read, acceptable use, and liability.",
  path: "/terms",
});

export default function TermsRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd("Terms of Use", "/terms")) }}
      />
      <TermsClient />
    </>
  );
}
