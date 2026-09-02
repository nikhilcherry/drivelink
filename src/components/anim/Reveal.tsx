'use client';
import { useEffect, useRef, createElement, type CSSProperties, type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade';

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 28, y: 0 },
  right: { x: -28, y: 0 },
  fade: { x: 0, y: 0 },
};

/**
 * Scroll-triggered entrance, built on IntersectionObserver and a CSS
 * transition.
 *
 * This used to be framer-motion, which put ~112 KB of animation library on the
 * first load of every page that revealed anything — for one fade and a 28px
 * translate. The site already had a CSS-driven reveal (RevealOnScroll +
 * .dlw-anim); this is the same idea with per-element direction and delay.
 *
 * The hidden state ships in the SSR HTML, so a <noscript> rule in the root
 * layout neutralises it — without JS the content is simply visible rather than
 * stuck at opacity 0.
 *
 * Intersection uses a threshold rather than a negative root margin: thresholds
 * behave the same on mobile, where root margins fire unpredictably.
 */
function useReveal<T extends HTMLElement>(threshold: number, once: boolean, staggerChildren = false) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.classList.add('is-in');
      if (!staggerChildren) return;
      // Siblings enter in sequence, capped so a long list doesn't crawl.
      const items = el.querySelectorAll<HTMLElement>('[data-reveal-item]');
      items.forEach((item, i) => {
        item.style.transitionDelay = `${Math.min(i * 80, 480)}ms`;
        item.classList.add('is-in');
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // A fast flick can coalesce past the threshold crossing entirely.
          // If the element is already above the viewport it has been scrolled
          // through, and leaving it at opacity 0 forever is the one failure
          // mode that actually matters here.
          const scrolledPast = once && entry.boundingClientRect.top < 0;
          if (!entry.isIntersecting && !scrolledPast) {
            if (!once) el.classList.remove('is-in');
            continue;
          }
          show();
          if (once) io.unobserve(el);
        }
      },
      // 0 alongside the real threshold so a partial crossing still reports.
      { threshold: [0, threshold] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, staggerChildren]);

  return ref;
}

const styleFor = (direction: Direction, delay: number): CSSProperties => {
  const { x, y } = OFFSET[direction];
  return {
    '--reveal-x': `${x}px`,
    '--reveal-y': `${y}px`,
    ...(delay ? { transitionDelay: `${delay}s` } : {}),
  } as CSSProperties;
};

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
  once?: boolean;
}

export function Reveal({ children, direction = 'up', delay = 0, className, as = 'div', once = true }: RevealProps) {
  const ref = useReveal<HTMLElement>(0.2, once);
  return createElement(
    as,
    { ref, className: className ? `dlw-reveal ${className}` : 'dlw-reveal', style: styleFor(direction, delay) },
    children,
  );
}

/** Staggered container — children using <RevealItem> enter in sequence. */
export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>(0.15, true, true);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-reveal-item className={className ? `dlw-reveal ${className}` : 'dlw-reveal'} style={styleFor('up', 0)}>
      {children}
    </div>
  );
}
