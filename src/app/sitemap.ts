import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/product", "/team", "/investors", "/v2v-communication"];
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
  // /docs is served from core.drivelink.tech (see vercel.json rewrite) — it has
  // no sitemap of its own, so it's listed here to keep it from being invisible
  // to crawlers. Both hosts sit under the same drivelink.tech domain.
  pages.push({
    url: "https://core.drivelink.tech/docs",
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  });
  return pages;
}
