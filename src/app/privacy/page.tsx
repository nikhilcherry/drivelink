import { PrivacyClient } from "./PrivacyClient";
import { pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy · DriveLink",
  description: "How DriveLink handles personal data submitted through drivelink.tech — job applications, assistant chat, and email — including retention, processors, and your rights.",
  path: "/privacy",
});

export default function PrivacyRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd("Privacy Policy", "/privacy")) }}
      />
      <PrivacyClient />
    </>
  );
}
