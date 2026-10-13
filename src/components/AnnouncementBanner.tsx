'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { useSiteBase } from '../lib/nav';

const STORAGE_KEY = 'dlw_banner_dismissed_v2';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const getServerSnapshot = () => false;

export function AnnouncementBanner() {
  const isDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const siteBase = useSiteBase();

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore storage write issues
    }
  };

  return (
    <aside
      className="dlw-announcement-bar"
      role="region"
      aria-label="Platform update notification"
      id="dlw-announcement-banner"
    >
      <div className="dlw-container dlw-announcement-inner">
        <div className="dlw-announcement-content">
          <div className="dlw-announcement-badge">
            <span className="dlw-announcement-dot" aria-hidden="true">
              <span className="dlw-announcement-dot-ping" />
            </span>
            <span className="dlw-announcement-badge-text">SYSTEM DEPLOYMENT</span>
          </div>

          <p className="dlw-announcement-text">
            <span className="dlw-announcement-highlight">DriveLink 2.0 Active Rollout:</span>{' '}
            Next-gen vehicle intent protocols &amp; real-time telemetry mesh deploying.
          </p>

          <Link
            href={siteBase + '/ecosystem'}
            className="dlw-announcement-link"
            id="announcement-cta-link"
          >
            <span>Explore Architecture</span>
            <ArrowRight size={13} className="dlw-announcement-arrow" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="dlw-announcement-close"
          aria-label="Dismiss platform update announcement"
          id="dismiss-announcement-btn"
          title="Dismiss notification"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
