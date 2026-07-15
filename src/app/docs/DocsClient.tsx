'use client';
import { useRouter } from 'next/navigation';
import { PageDocs } from '../pages/PageDocs';
import { hrefFor, type Page } from '../../lib/nav';
import type { RepoStatsMap } from '../../sections/RepoShowcase';

export function DocsClient({ repoStats }: { repoStats: RepoStatsMap }) {
  const router = useRouter();
  return <PageDocs setPage={(p: Page) => router.push(hrefFor(p))} repoStats={repoStats} />;
}
