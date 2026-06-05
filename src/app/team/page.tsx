'use client';
import { useRouter } from 'next/navigation';
import { PageTeam } from '../pages/PageTeam';
import { hrefFor, type Page } from '../../lib/nav';

export default function TeamRoute() {
  const router = useRouter();
  return <PageTeam setPage={(p: Page) => router.push(hrefFor(p))} />;
}
