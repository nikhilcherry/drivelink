import type { Metadata } from 'next';

export const SITE_URL = 'https://www.drivelink.tech';
export const OG_IMAGE = '/og.png';
export const SITE_NAME = 'DriveLink';

/**
 * Next.js does not deep-merge `openGraph`/`twitter` objects between layout
 * and page metadata — a page that only overrides `openGraph.url` silently
 * drops the parent's `images`/`siteName`/`type`. Building the full object
 * per route avoids that trap.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'DriveLink — Sub-50ms V2V intent protocol' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
