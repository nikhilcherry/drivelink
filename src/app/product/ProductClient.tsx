'use client';
import { useRouter } from 'next/navigation';
import { PageProduct } from '../pages/PageProduct';
import { hrefFor, type Page } from '../../lib/nav';

export function ProductClient() {
  const router = useRouter();
  return <PageProduct setPage={(p: Page) => router.push(hrefFor(p))} />;
}
