'use client';
import { useRouter } from 'next/navigation';
import { PageEcosystem } from '../pages/PageEcosystem';
import { hrefFor, type Page } from '../../lib/nav';

export function EcosystemClient() {
  const router = useRouter();
  return <PageEcosystem setPage={(p: Page) => router.push(hrefFor(p))} />;
}
