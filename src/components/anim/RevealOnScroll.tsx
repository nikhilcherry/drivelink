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
 * Supported types: section-head, content, stats.
 * Variant styling (transform, transition, stagger) is defined in globals.css.
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

// Default variant for each selector
const SELECTOR_VARIANTS: Record<string, string> = {
  '.dlw-section-head': 'section-head',
  '.dlw-story-item': 'content',
  '.dlw-tier-head': 'section-head',
  '.dlw-rost-card': 'content',
  '.dlw-roadmap-head': 'section-head',
  '.dlw-roadmap-row': 'content',
  '.dlw-stat': 'stats',
  '.dlw-manifesto-inner': 'content',
  '.dlw-market-card': 'content',
  '.dlw-arch-row': 'content',
  '.dlw-repo-card': 'content',
  '.dlw-doc-kpi': 'stats',
  '.dlw-doc-card': 'content',
  '.dlw-doc-tlitem': 'content',
  '.dlw-doc-pnode-wrap': 'content',
  '.dlw-traction-card': 'content',
  '.dlw-advisor': 'content',
  '.dlw-team-detail': 'content',
  '.dlw-revenue': 'content',
  '.dlw-cta-inner': 'content',
};

function getVariantForElement(el: HTMLElement): string {
  // Explicit data-reveal-type takes precedence
  const explicit = el.getAttribute('data-reveal-type');
  if (explicit) return explicit;

  // Fall back to selector-based mapping
  for (const [selector, variant] of Object.entries(SELECTOR_VARIANTS)) {
    if (el.matches(selector)) return variant;
  }
  return 'content';
}

function getStaggerConfig(variant: string): { base: number; step: number; max: number } {
  switch (variant) {
    case 'stats': return { base: 80, step: 80, max: 400 };
    case 'content': return { base: 60, step: 60, max: 360 };
    default: return { base: 0, step: 0, max: 0 };
  }
}

export function RevealOnScroll() {
  const pathname = usePathname();
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const raf = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS))
        .filter((el) => !el.classList.contains('dlw-in') && !el.classList.contains('dlw-anim') && !el.classList.contains('dlw-reveal') && !el.hasAttribute('data-reveal-item'));
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
        const variant = key.split('-').pop() || 'content';
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
      ioRef.current = null;
    };
  }, [pathname]);

  return null;
}