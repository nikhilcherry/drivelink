'use client';
import { useEffect, useState } from 'react';
import { SITE_URL } from './seo';

export type Page = 'home' | 'product' | 'team' | 'investors' | 'hiring' | 'docs';

/** Docs is served here via a Vercel host-rewrite; it has no other routes. */
export const CORE_HOST = 'core.drivelink.tech';

/** URL path for a page key. */
export const hrefFor = (p: Page): string => (p === 'home' ? '/' : `/${p}`);

const TAB_SEGMENTS = ['product', 'team', 'investors', 'hiring', 'docs'];

/** Page key for a URL pathname, falling back to home. */
export const pageFromPath = (path: string): Page => {
  const seg = (path || '/').replace(/^\/+/, '').split('/')[0];
  return (TAB_SEGMENTS.includes(seg) ? seg : 'home') as Page;
};

/**
 * Whether a pathname is one of the nav's own destinations. pageFromPath falls
 * back to 'home', which would otherwise light up the Home tab — and announce
 * aria-current="page" — on /privacy, /terms, and every 404.
 */
export const isNavPath = (path: string): boolean => {
  const p = path || '/';
  if (p === '/' || p === '') return true;
  return TAB_SEGMENTS.includes(p.replace(/^\/+/, '').split('/')[0]);
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
    if (window.location.hostname === CORE_HOST) setBase(SITE_URL); // eslint-disable-line react-hooks/set-state-in-effect -- hydration-safe: starts "" to match SSR, flips post-mount
  }, []);
  return base;
}
