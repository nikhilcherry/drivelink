'use client';
import { useSyncExternalStore } from 'react';
import { X } from 'lucide-react';

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
          <p className="dlw-announcement-text">
            <span className="dlw-announcement-highlight">Scheduled Maintenance:</span>{' '}
            We are currently updating the platform with system improvements and new features.
          </p>
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
