'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LogoMark } from './ui/Logo';
import { AnnouncementBanner } from './AnnouncementBanner';
import { hrefFor, isNavPath, pageFromPath, useSiteBase, type Page } from '../lib/nav';

const tabs: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'product', label: 'Product' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'team', label: 'Team' },
  { id: 'investors', label: 'Investors' },
];

function FlipText({ text }: { text: string }) {
  const chars = text.split('');
  return (
    <span className="dlw-nav-flip" aria-hidden="true">
      <span className="dlw-nav-flip-track dlw-nav-flip-primary">
        {chars.map((char, i) => (
          <span
            key={i}
            className="dlw-nav-flip-char"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
      <span className="dlw-nav-flip-track dlw-nav-flip-secondary">
        {chars.map((char, i) => (
          <span
            key={i}
            className="dlw-nav-flip-char"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const path = pathname || '/';
  // null on a page the nav doesn't point at (/privacy, /terms, a 404), so no
  // tab is highlighted or announced as current.
  const current = isNavPath(path) ? pageFromPath(path) : null;
  const siteBase = useSiteBase();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const navCenterRef = useRef<HTMLDivElement>(null);
  const [hoveredTab, setHoveredTab] = useState<Page | null>(null);
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const activeTabId = hoveredTab ?? current;

  useEffect(() => {
    const updatePill = () => {
      if (!navCenterRef.current) return;
      if (!activeTabId) {
        setPillStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }
      const tabEl = navCenterRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTabId}"]`);
      if (tabEl) {
        setPillStyle({
          left: tabEl.offsetLeft,
          top: tabEl.offsetTop,
          width: tabEl.offsetWidth,
          height: tabEl.offsetHeight,
          opacity: 1,
        });
      } else {
        setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [activeTabId, current]);

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
      <header className="dlw-top-header">
        <AnnouncementBanner />
        <nav className={'dlw-nav ' + (scrolled ? 'is-scrolled' : '')} aria-label="Primary">
        <div className="dlw-container dlw-nav-inner">
          <Link className="dlw-brand" href={siteBase + hrefFor('home')}>
            <LogoMark size={36} className="dlw-brand-mark" />
            <span className="dlw-brand-wm">DriveLink</span>
          </Link>

          <div
            ref={navCenterRef}
            className="dlw-nav-center"
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div
              className="dlw-nav-pill-indicator"
              style={{
                transform: `translate3d(${pillStyle.left}px, ${pillStyle.top}px, 0)`,
                width: pillStyle.width,
                height: pillStyle.height,
                opacity: pillStyle.opacity,
              }}
              aria-hidden="true"
            />
            {tabs.map((t) => (
              <Link
                key={t.id}
                data-tab-id={t.id}
                href={siteBase + hrefFor(t.id)}
                className={'dlw-nav-tab ' + (current === t.id ? 'is-active' : '')}
                aria-current={current === t.id ? 'page' : undefined}
                onMouseEnter={() => setHoveredTab(t.id)}
                onFocus={() => setHoveredTab(t.id)}
              >
                <FlipText text={t.label} />
                <span className="sr-only">{t.label}</span>
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
      </header>

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
