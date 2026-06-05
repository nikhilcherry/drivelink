'use client';
import { useRouter } from 'next/navigation';
import { PageDocs } from '../pages/PageDocs';
import { hrefFor, type Page } from '../../lib/nav';

export default function DocsRoute() {
  const router = useRouter();
  return <PageDocs setPage={(p: Page) => router.push(hrefFor(p))} />;
}
