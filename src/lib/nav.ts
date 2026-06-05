export type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

/** URL path for a page key. */
export const hrefFor = (p: Page): string => (p === 'home' ? '/' : `/${p}`);

/** Page key for a URL pathname. */
export const pageFromPath = (path: string): Page => {
  const seg = (path || '/').replace(/^\/+/, '').split('/')[0];
  return (['product', 'team', 'investors', 'docs'].includes(seg) ? seg : 'home') as Page;
};
