'use client';
import { useRouter } from 'next/navigation';
import { PageInvestors } from '../pages/PageInvestors';
import { hrefFor, type Page } from '../../lib/nav';

export default function InvestorsRoute() {
  const router = useRouter();
  return <PageInvestors setPage={(p: Page) => router.push(hrefFor(p))} />;
}
