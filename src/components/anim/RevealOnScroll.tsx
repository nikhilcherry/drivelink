'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Site-wide scroll reveal. One IntersectionObserver fades + lifts existing
 * `dlw-*` blocks into view with a small per-sibling stagger. No per-section
 * wiring needed — it targets class names that already exist. Reduced-motion
 * users get everything shown instantly, and each element drops back to its
 * native transitions once revealed so hover effects stay snappy.
 *
 * Variants: elements can opt into a reveal variant via `data-reveal-type`.
 * Supported types: section-head, manifesto, stats, story, roadmap, hiw, card, timeline, cta.
 * Variant styling (transform, transition, stagger) is defined in globals.css.
 *
 * Also manages section theme transitions by observing section roots and
 * setting data-theme on .dlw-page for smooth background shifts.
 */
const SELECTORS = [
  '.dlw-section-head',
  '.dlw-story-item',
  '.dlw-tier-head',
  '.dlw-rost-card',
  '.dlw-roadmap-head',
  '.dlw-roadmap-row',
  '.dlw-stat',
  '.dlw-manifesto-inner',
  '.dlw-hiw-stage',
  '.dlw-market-card',
  '.dlw-arch-row',
  '.dlw-repo-card',
  '.dlw-doc-kpi',
  '.dlw-doc-card',
  '.dlw-doc-tlitem',
  '.dlw-doc-pnode-wrap',
  '.dlw-traction-card',
  '.dlw-advisor',
  '.dlw-team-detail',
  '.dlw-revenue',
  '.dlw-cta-inner',
].join(',');

// Default variant for each selector (matches the selector order above)
const SELECTOR_VARIANTS: Record<string, string> = {
  '.dlw-section-head': 'section-head',
  '.dlw-story-item': 'story',
  '.dlw-tier-head': 'section-head',
  '.dlw-rost-card': 'card',
  '.dlw-roadmap-head': 'roadmap',
  '.dlw-roadmap-row': 'roadmap',
  '.dlw-stat': 'stats',
  '.dlw-manifesto-inner': 'manifesto',
  '.dlw-hiw-stage': 'hiw',
  '.dlw-market-card': 'card',
  '.dlw-arch-row': 'card',
  '.dlw-repo-card': 'card',
  '.dlw-doc-kpi': 'stats',
  '.dlw-doc-card': 'card',
  '.dlw-doc-tlitem': 'timeline',
  '.dlw-doc-pnode-wrap': 'card',
  '.dlw-traction-card': 'card',
  '.dlw-advisor': 'card',
  '.dlw-team-detail': 'card',
  '.dlw-revenue': 'card',
  '.dlw-cta-inner': 'cta',
};

// Section root selectors for theme transitions
const SECTION_ROOTS = [
  { selector: '.dlw-hero', theme: 'light' },
  { selector: '.dlw-manifesto', theme: 'light' },
  { selector: '.dlw-howitworks', theme: 'light' },
  { selector: '.dlw-stats', theme: 'dark' },
  { selector: '.dlw-section-paper', theme: 'paper' },
  { selector: '.dlw-roadmap', theme: 'dark' },
  { selector: '.dlw-cta', theme: 'dark' },
];

function getVariantForElement(el: HTMLElement): string {
  // Explicit data-reveal-type takes precedence
  const explicit = el.getAttribute('data-reveal-type');
  if (explicit) return explicit;

  // Fall back to selector-based mapping
  for (const [selector, variant] of Object.entries(SELECTOR_VARIANTS)) {
    if (el.matches(selector)) return variant;
  }
  return 'card';
}

function getStaggerConfig(variant: string): { base: number; step: number; max: number } {
  switch (variant) {
    case 'stats': return { base: 80, step: 80, max: 400 };
    case 'story': return { base: 120, step: 100, max: 500 };
    case 'roadmap': return { base: 100, step: 120, max: 600 };
    case 'card': return { base: 60, step: 60, max: 360 };
    case 'timeline': return { base: 80, step: 80, max: 480 };
    default: return { base: 0, step: 0, max: 0 };
  }
}

export function RevealOnScroll() {
  const pathname = usePathname();
  const ioRef = useRef<IntersectionObserver | null>(null);
  const themeIoRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const page = document.querySelector('.dlw-page') as HTMLElement | null;

    // Theme observer — watches section roots to set data-theme on .dlw-page
    const themeIo = new IntersectionObserver(
      (entries) => {
        if (reduce || !page) return;
        // Find the section with highest intersection ratio
        let bestEntry: IntersectionObserverEntry | null = null;
        let bestRatio = -1;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        }
        if (bestEntry) {
          const target = bestEntry.target as HTMLElement;
          const section = SECTION_ROOTS.find(s => target.matches(s.selector));
          if (section) {
            page.dataset.theme = section.theme;
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '0px 0px -20% 0px' }
    );

    SECTION_ROOTS.forEach(({ selector }) => {
      const el = document.querySelector(selector);
      if (el) themeIo.observe(el);
    });
    themeIoRef.current = themeIo;

    const raf = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS))
        .filter((el) => !el.classList.contains('dlw-in') && !el.classList.contains('dlw-anim'));
      if (!els.length) return;

      if (reduce) {
        els.forEach((el) => el.classList.add('dlw-in'));
        return;
      }

      // Group by parent AND variant for proper staggering
      const byParentAndVariant = new Map<string, HTMLElement[]>();
      els.forEach((el) => {
        el.classList.add('dlw-anim');
        const variant = getVariantForElement(el);
        el.dataset.revealType = variant;
        const p = el.parentElement;
        if (!p) return;
        const key = `${p.isEqualNode ? 'parent' : 'root'}-${variant}`;
        const arr = byParentAndVariant.get(key) || [];
        arr.push(el);
        byParentAndVariant.set(key, arr);
      });

      byParentAndVariant.forEach((arr, key) => {
        const variant = key.split('-').pop() || 'card';
        const { base, step, max } = getStaggerConfig(variant);
        arr.forEach((el, i) => {
          const delay = base + Math.min(i * step, max);
          el.style.transitionDelay = `${delay}ms`;
        });
      });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            el.classList.add('dlw-in');
            io.unobserve(el);
            // Restore native transitions so hover/interaction isn't delayed.
            window.setTimeout(() => {
              el.classList.remove('dlw-anim');
              el.style.transitionDelay = '';
            }, 1000);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );

      els.forEach((el) => io.observe(el));
      ioRef.current = io;
    });

    return () => {
      cancelAnimationFrame(raf);
      ioRef.current?.disconnect();
      themeIoRef.current?.disconnect();
      ioRef.current = null;
      themeIoRef.current = null;
    };
  }, [pathname]);

  return null;
}