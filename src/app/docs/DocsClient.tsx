'use client';
import { useRouter } from 'next/navigation';
import { PageDocs } from '../pages/PageDocs';
import { hrefFor, CORE_HOST, type Page } from '../../lib/nav';
import { SITE_URL } from '../../lib/seo';
import type { RepoStatsMap } from '../../sections/RepoShowcase';

export function DocsClient({ repoStats }: { repoStats: RepoStatsMap }) {
  const router = useRouter();
  const setPage = (p: Page) => {
    if (window.location.hostname === CORE_HOST) {
      window.location.href = `${SITE_URL}${hrefFor(p)}`;
    } else {
      router.push(hrefFor(p));
    }
  };
  return <PageDocs setPage={setPage} repoStats={repoStats} />;
}
