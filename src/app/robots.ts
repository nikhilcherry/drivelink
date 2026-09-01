import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // /desk is the internal hiring tool — no reason for it in an index.
    rules: { userAgent: "*", allow: "/", disallow: ["/desk"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
