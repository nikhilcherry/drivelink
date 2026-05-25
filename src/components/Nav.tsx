'use client';
import { useState, useEffect } from 'react';
import { Zap, Menu, X } from 'lucide-react';

type Page = 'home' | 'product' | 'team' | 'investors';

interface NavProps {
  page: Page;
  setPage: (page: Page) => void;
}

const tabs: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'product', label: 'Product' },
  { id: 'team', label: 'Team' },
  { id: 'investors', label: 'Investors' },
];

export function Nav({ page, setPage }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  const navigate = (p: Page) => {
    setPage(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <>
      <nav className={'dlw-nav ' + (scrolled ? 'is-scrolled' : '')}>
        <div className="dlw-container dlw-nav-inner">
          <button className="dlw-brand" onClick={() => navigate('home')}>
            <span className="dlw-brand-mark">
              <Zap size={20} color="#fff" />
            </span>
            <span className="dlw-brand-wm">DriveLink</span>
          </button>

          <div className="dlw-nav-center">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={'dlw-nav-tab ' + (page === t.id ? 'is-active' : '')}
                onClick={() => navigate(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="dlw-nav-right">
            <button className="dlw-nav-pill" onClick={() => navigate('investors')}>
              Partner with us
            </button>
          </div>

          <button className="dlw-nav-mobile" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="dlw-nav-drawer">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={'dlw-nav-drawer-tab ' + (page === t.id ? 'is-active' : '')}
              onClick={() => navigate(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
