'use client';
import { useEffect, useState } from 'react';
import { SITE_URL } from './seo';

export type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

/** Docs is served here via a Vercel host-rewrite; it has no other routes. */
export const CORE_HOST = 'core.drivelink.tech';

/** URL path for a page key. */
export const hrefFor = (p: Page): string => (p === 'home' ? '/' : `/${p}`);

/** Page key for a URL pathname. */
export const pageFromPath = (path: string): Page => {
  const seg = (path || '/').replace(/^\/+/, '').split('/')[0];
  return (['product', 'team', 'investors', 'docs'].includes(seg) ? seg : 'home') as Page;
};

/**
 * core.drivelink.tech only maps "/" to the docs page (see vercel.json), so any
 * link to another top-level page rendered there must be absolute. Returns ""
 * on the main site (relative links work as-is) and the main site's origin once
 * mounted on the docs subdomain. Starts as "" (matching SSR output) and flips
 * after mount to avoid a hydration mismatch.
 */
export function useSiteBase(): string {
  const [base, setBase] = useState('');
  useEffect(() => {
    if (window.location.hostname === CORE_HOST) setBase(SITE_URL);
  }, []);
  return base;
}
