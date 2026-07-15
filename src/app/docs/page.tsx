import { DocsClient } from "./DocsClient";
import type { RepoStatsMap } from "../../sections/RepoShowcase";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Technical Docs · DriveLink",
  description: "How DriveLink actually works — system architecture, the RandomForest decision models, SUMO realism validation, and the V2V/V2I wire protocol.",
  path: "/docs",
});

const REPO_SLUGS = ["nikhilcherry/drivelink-sim", "nikhilcherry/drivelink_software"];

// Baked-in fallback so the cards never show zeros if the build-time fetch fails
// (offline build, GitHub API down, or unauthenticated rate limit).
const FALLBACK_STATS: RepoStatsMap = {
  "nikhilcherry/drivelink-sim": { stars: 2, forks: 1, issues: 1, pushedAt: null, langs: { GDScript: 55760 } },
  "nikhilcherry/drivelink_software": { stars: 2, forks: 1, issues: 1, pushedAt: null, langs: { GDScript: 120891, Python: 74009 } },
};

async function fetchRepoStats(slug: string) {
  const base = `https://api.github.com/repos/${slug}`;
  const [metaRes, langsRes] = await Promise.all([
    fetch(base, { next: { revalidate: 21600 } }),
    fetch(`${base}/languages`, { next: { revalidate: 21600 } }),
  ]);
  if (!metaRes.ok) throw new Error(`GitHub API ${metaRes.status} for ${slug}`);
  const meta = await metaRes.json();
  const langs = langsRes.ok ? await langsRes.json() : null;
  return {
    stars: meta.stargazers_count ?? FALLBACK_STATS[slug].stars,
    forks: meta.forks_count ?? FALLBACK_STATS[slug].forks,
    issues: meta.open_issues_count ?? FALLBACK_STATS[slug].issues,
    pushedAt: meta.pushed_at ?? null,
    langs: langs && Object.keys(langs).length ? langs : FALLBACK_STATS[slug].langs,
  };
}

async function getRepoStats(): Promise<RepoStatsMap> {
  const stats: RepoStatsMap = { ...FALLBACK_STATS };
  await Promise.all(
    REPO_SLUGS.map(async (slug) => {
      try {
        stats[slug] = await fetchRepoStats(slug);
      } catch {
        // Keep the cached fallback for this repo — never render zeros.
      }
    })
  );
  return stats;
}

export default async function DocsRoute() {
  const repoStats = await getRepoStats();
  return <DocsClient repoStats={repoStats} />;
}
