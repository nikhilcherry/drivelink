'use client';
import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  /** Optional lower bound to animate up from once in view. Omit to render `to` statically (no animation). */
  from?: number;
  duration?: number; // seconds
  decimals?: number;
  suffix?: string;
  className?: string;
}

/**
 * Renders `to` immediately — the real, correct value is always on screen for
 * first paint, crawlers, and JS-disabled visitors. When `from` is supplied,
 * it briefly animates up from that (non-zero) value the first time it
 * scrolls into view, purely as a visual flourish.
 */
export function CountUp({ to, from, duration = 1.4, decimals = 0, suffix = '', className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [value, setValue] = useState(to);
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (ioRef.current) {
              ioRef.current.unobserve(el);
              ioRef.current.disconnect();
              ioRef.current = null;
            }
          }
        }
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    ioRef.current = io;

    return () => {
      ioRef.current?.disconnect();
      ioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!inView || from === undefined) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(to); // eslint-disable-line react-hooks/set-state-in-effect -- skip the animation, jump straight to the final value
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, from, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}