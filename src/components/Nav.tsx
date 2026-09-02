'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LogoMark } from './ui/Logo';
import { hrefFor, pageFromPath, useSiteBase, type Page } from '../lib/nav';

const tabs: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'product', label: 'Product' },
  { id: 'team', label: 'Team' },
  { id: 'investors', label: 'Investors' },
];

export function Nav() {
  const pathname = usePathname();
  const current = pageFromPath(pathname || '/');
  const siteBase = useSiteBase();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Passive + rAF-coalesced: this fires on every scroll frame, and a
    // non-passive listener here blocks the compositor on touch devices.
    let queued = false;
    const apply = () => {
      queued = false;
      setScrolled(window.scrollY > 12);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false); // eslint-disable-line react-hooks/set-state-in-effect -- resetting derived UI state on prop change
  }, [pathname]);

  // An open drawer covers the page, so the page behind it must not scroll and
  // Escape must close it — otherwise a keyboard user is trapped behind an
  // overlay with no way out but Tab.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className={'dlw-nav ' + (scrolled ? 'is-scrolled' : '')} aria-label="Primary">
        <div className="dlw-container dlw-nav-inner">
          <Link className="dlw-brand" href={siteBase + hrefFor('home')}>
            <LogoMark size={36} className="dlw-brand-mark" />
            <span className="dlw-brand-wm">DriveLink</span>
          </Link>

          <div className="dlw-nav-center">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={siteBase + hrefFor(t.id)}
                className={'dlw-nav-tab ' + (current === t.id ? 'is-active' : '')}
                aria-current={current === t.id ? 'page' : undefined}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="dlw-nav-right">
            <Link className="dlw-nav-pill" href={siteBase + hrefFor('hiring')}>
              Join us
            </Link>
          </div>

          <button
            ref={toggleRef}
            className="dlw-nav-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="dlw-nav-drawer"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="dlw-nav-drawer" id="dlw-nav-drawer">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={siteBase + hrefFor(t.id)}
              className={'dlw-nav-drawer-tab ' + (current === t.id ? 'is-active' : '')}
              aria-current={current === t.id ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {t.label}
            </Link>
          ))}
          {/* The CTA pill lives in .dlw-nav-right, which is display:none below
              768px — without this entry it is unreachable on mobile entirely. */}
          <Link
            href={siteBase + hrefFor('hiring')}
            className={'dlw-nav-drawer-tab is-cta ' + (current === 'hiring' ? 'is-active' : '')}
            aria-current={current === 'hiring' ? 'page' : undefined}
            onClick={() => setMobileOpen(false)}
          >
            Join us
          </Link>
        </div>
      )}
    </>
  );
}
