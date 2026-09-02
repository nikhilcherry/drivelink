import { describe, it, expect } from 'vitest';
import { pageMetadata, breadcrumbJsonLd, SITE_URL, OG_IMAGE } from '../src/lib/seo';
import { hrefFor, pageFromPath } from '../src/lib/nav';

/**
 * The failure these guard against is silent: Next.js does not deep-merge
 * openGraph/twitter between layout and page metadata, so a route that only
 * sets openGraph.url ships with no image and no siteName — and nothing warns
 * you. Every route goes through pageMetadata for exactly that reason.
 */
describe('pageMetadata', () => {
  const meta = pageMetadata({ title: 'Team · DriveLink', description: 'The team.', path: '/team' });

  it('builds a complete openGraph object rather than a partial override', () => {
    expect(meta.openGraph).toMatchObject({
      title: 'Team · DriveLink',
      description: 'The team.',
      url: `${SITE_URL}/team`,
      siteName: 'DriveLink',
      type: 'website',
    });
    expect(meta.openGraph?.images).toHaveLength(1);
  });

  it('always carries a twitter card with an image', () => {
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(meta.twitter?.images).toEqual([OG_IMAGE]);
  });

  it('canonicalises the home page to the bare origin, not origin + slash-path', () => {
    expect(pageMetadata({ title: 't', description: 'd', path: '/' }).openGraph?.url).toBe(SITE_URL);
  });

  it('lets the docs subdomain override the canonical entirely', () => {
    const docs = pageMetadata({
      title: 'Docs',
      description: 'd',
      path: '/docs',
      absoluteUrl: 'https://core.drivelink.tech/docs',
    });
    expect(docs.alternates?.canonical).toBe('https://core.drivelink.tech/docs');
    expect(docs.openGraph?.url).toBe('https://core.drivelink.tech/docs');
  });
});

describe('breadcrumbJsonLd', () => {
  it('puts the home page first and the route second, both absolute', () => {
    const crumbs = breadcrumbJsonLd('Product', '/product');
    expect(crumbs.itemListElement.map((i) => i.item)).toEqual([SITE_URL, `${SITE_URL}/product`]);
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});

describe('route helpers', () => {
  it('round-trips every page key through its href', () => {
    for (const page of ['home', 'product', 'team', 'investors', 'hiring', 'docs'] as const) {
      expect(pageFromPath(hrefFor(page))).toBe(page);
    }
  });

  it('maps home to "/" rather than "/home"', () => {
    expect(hrefFor('home')).toBe('/');
  });

  it('falls back to home for unknown, empty, and nested paths', () => {
    expect(pageFromPath('/nonsense')).toBe('home');
    expect(pageFromPath('')).toBe('home');
    expect(pageFromPath('/')).toBe('home');
    expect(pageFromPath('/privacy')).toBe('home');
  });

  it('reads the first segment of a nested path', () => {
    expect(pageFromPath('/team/someone')).toBe('team');
  });
});
