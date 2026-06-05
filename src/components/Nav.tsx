'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { hrefFor, pageFromPath, type Page } from '../lib/nav';

const tabs: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'product', label: 'Product' },
  { id: 'docs', label: 'Docs' },
  { id: 'team', label: 'Team' },
  { id: 'investors', label: 'Investors' },
];

export function Nav() {
  const pathname = usePathname();
  const current = pageFromPath(pathname || '/');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  // close the drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={'dlw-nav ' + (scrolled ? 'is-scrolled' : '')}>
        <div className="dlw-container dlw-nav-inner">
          <Link className="dlw-brand" href="/">
            <span className="dlw-brand-mark">
              <Zap size={20} color="#fff" />
            </span>
            <span className="dlw-brand-wm">DriveLink</span>
          </Link>

          <div className="dlw-nav-center">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={hrefFor(t.id)}
                className={'dlw-nav-tab ' + (current === t.id ? 'is-active' : '')}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="dlw-nav-right">
            <Link className="dlw-nav-pill" href="/investors">
              Partner with us
            </Link>
          </div>

          <button className="dlw-nav-mobile" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="dlw-nav-drawer">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={hrefFor(t.id)}
              className={'dlw-nav-drawer-tab ' + (current === t.id ? 'is-active' : '')}
              onClick={() => setMobileOpen(false)}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
