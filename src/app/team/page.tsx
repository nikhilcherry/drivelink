import { TeamClient } from "./TeamClient";
import { SITE_URL, pageMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Team · DriveLink",
  description: "Meet the DriveLink founders, core team, and mentors building the V2V communication backbone for automotive AI.",
  path: "/team",
});

const founders = [
  { name: "Hruday", jobTitle: "CEO · Chief Systems Architect" },
  { name: "Nikhil", jobTitle: "CTO", sameAs: "https://github.com/nikhilcherry" },
  { name: "Krishna", jobTitle: "CPO · Mechanical Engineering" },
  { name: "Shreyas", jobTitle: "Chief Development Officer", sameAs: "https://github.com/shreyasrajshekar" },
];

const peopleJsonLd = founders.map((f) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: f.name,
  jobTitle: f.jobTitle,
  worksFor: { "@type": "Organization", name: "DriveLink", url: SITE_URL },
  ...(f.sameAs ? { sameAs: [f.sameAs] } : {}),
}));

export default function TeamRoute() {
  return (
    <>
      {peopleJsonLd.map((p, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(p) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd("Team", "/team")) }}
      />
      <TeamClient />
    </>
  );
}
