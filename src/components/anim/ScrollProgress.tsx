'use client';
import { useEffect, useRef } from 'react';

/**
 * Thin gradient progress bar pinned to the top of the viewport.
 *
 * Hand-rolled rather than framer-motion's useScroll/useSpring: this renders in
 * the root layout, so importing framer-motion here pulled ~114 KB of it into
 * the first load of every page — including /privacy and /404, which animate
 * nothing. A critically-damped spring on one transform is a few lines.
 */
const STIFFNESS = 120;
const DAMPING = 30;
const REST_DELTA = 0.001;

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const progress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    };

    // With motion reduced, track scroll exactly and skip the spring loop
    // entirely — no rAF running for the life of the page.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let value = progress();
    let velocity = 0;
    let last = 0;

    const paint = () => {
      // The spring can overshoot; a bar wider than the viewport is the one
      // place that reads as a bug rather than as bounce.
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
    };

    const settle = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const target = progress();
      // Standard spring integration: F = -k·x - c·v.
      velocity += (STIFFNESS * (target - value) - DAMPING * velocity) * dt;
      value += velocity * dt;
      paint();
      if (Math.abs(target - value) < REST_DELTA && Math.abs(velocity) < REST_DELTA) {
        value = target;
        velocity = 0;
        paint();
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(settle);
    };

    const onScroll = () => {
      if (reduce.matches) {
        value = progress();
        paint();
        return;
      }
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(settle);
    };

    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="dlw-scroll-progress" style={{ transform: 'scaleX(0)' }} />;
}
