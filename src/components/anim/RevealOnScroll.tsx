'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Site-wide scroll reveal. One IntersectionObserver fades + lifts existing
 * `dlw-*` blocks into view with a small per-sibling stagger. No per-section
 * wiring needed — it targets class names that already exist. Reduced-motion
 * users get everything shown instantly, and each element drops back to its
 * native transitions once revealed so hover effects stay snappy.
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

export function RevealOnScroll() {
  const pathname = usePathname();
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const raf = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS))
        .filter((el) => !el.classList.contains('dlw-in') && !el.classList.contains('dlw-anim'));
      if (!els.length) return;

      if (reduce) {
        els.forEach((el) => el.classList.add('dlw-in'));
        return;
      }

      // Stagger siblings that share a parent for a sequential reveal.
      const byParent = new Map<Element, HTMLElement[]>();
      els.forEach((el) => {
        el.classList.add('dlw-anim');
        const p = el.parentElement;
        if (!p) return;
        const arr = byParent.get(p) || [];
        arr.push(el);
        byParent.set(p, arr);
      });
      byParent.forEach((arr) =>
        arr.forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
        })
      );

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
      ioRef.current = null;
    };
  }, [pathname]);

  return null;
}
