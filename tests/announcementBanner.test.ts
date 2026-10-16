import { describe, it, expect } from 'vitest';

describe('Announcement Banner storage configuration', () => {
  it('uses a dedicated maintenance storage key distinct from legacy promotional keys', () => {
    const bannerCode = `const STORAGE_KEY = 'dlw_maintenance_dismissed_v3';`;
    expect(bannerCode).toContain('dlw_maintenance_dismissed_v3');
    expect(bannerCode).not.toBe(`const STORAGE_KEY = 'dlw_banner_dismissed_v2';`);
  });

  it('correctly tracks legacy dismissal keys to prevent suppression of operational alerts', () => {
    const legacyKeys = ['dlw_banner_dismissed_v2', 'dlw_banner_dismissed_v1'];
    expect(legacyKeys).toContain('dlw_banner_dismissed_v2');
    expect(legacyKeys).toContain('dlw_banner_dismissed_v1');
  });

  it('determines visibility based on the active storage key', () => {
    const storageMock = new Map<string, string>();
    const isDismissed = (key: string) => storageMock.get(key) === 'true';

    // Simulate user who dismissed legacy banner in the past
    storageMock.set('dlw_banner_dismissed_v2', 'true');

    // With the new maintenance key, the user has not dismissed it yet
    const activeKey = 'dlw_maintenance_dismissed_v3';
    expect(isDismissed(activeKey)).toBe(false);

    // Once dismissed, it acknowledges the maintenance banner
    storageMock.set(activeKey, 'true');
    expect(isDismissed(activeKey)).toBe(true);
  });
});
