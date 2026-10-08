'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LogoMark } from './ui/Logo';
import { hrefFor, isNavPath, pageFromPath, useSiteBase, type Page } from '../lib/nav';

interface NavTab {
  id: string;
  label: string;
  href: string;
  pageKey?: Page;
  isAnchor?: boolean;
}

const tabs: NavTab[] = [
  { id: 'home', label: 'Home', href: '/', pageKey: 'home' },
  { id: 'product', label: 'Product', href: '/#how-connect-works', isAnchor: true },
  { id: 'team', label: 'Team', href: '/team', pageKey: 'team' },
  { id: 'investors', label: 'Investors', href: '/investors', pageKey: 'investors' },
];

export function Nav() {
  const pathname = usePathname();
  const path = pathname || '/';
  // null on a page the nav doesn't point at (/privacy, /terms, a 404), so no
  // tab is highlighted or announced as current.
  const current = isNavPath(path) ? pageFromPath(path) : null;
  const isHomepage = path === '/' || path === '';
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

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: NavTab) => {
    if (tab.isAnchor && isHomepage) {
      const el = document.getElementById('how-connect-works');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', '#how-connect-works');
      }
    }
  };

  const handleDrawerTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: NavTab) => {
    setMobileOpen(false);
    if (tab.isAnchor && isHomepage) {
      const el = document.getElementById('how-connect-works');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', '#how-connect-works');
      }
    }
  };

  return (
    <>
      <nav className={'dlw-nav ' + (scrolled ? 'is-scrolled' : '')} aria-label="Primary">
        <div className="dlw-container dlw-nav-inner">
          <Link className="dlw-brand" href={siteBase + hrefFor('home')}>
            <LogoMark size={36} className="dlw-brand-mark" />
            <span className="dlw-brand-wm">DriveLink</span>
          </Link>

          <div className="dlw-nav-center">
            {tabs.map((t) => {
              const active = t.pageKey ? current === t.pageKey : false;
              return (
                <Link
                  key={t.id}
                  href={siteBase + t.href}
                  className={'dlw-nav-tab ' + (active ? 'is-active' : '')}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => handleTabClick(e, t)}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          <div className="dlw-nav-right">
            <Link
              className="dlw-nav-pill"
              href={siteBase + hrefFor('hiring')}
              aria-label="Join our team or submit application"
            >
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
          {tabs.map((t) => {
            const active = t.pageKey ? current === t.pageKey : false;
            return (
              <Link
                key={t.id}
                href={siteBase + t.href}
                className={'dlw-nav-drawer-tab ' + (active ? 'is-active' : '')}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => handleDrawerTabClick(e, t)}
              >
                {t.label}
              </Link>
            );
          })}
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
