'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Deferred loader for the assistant widget.
 *
 * The widget itself pulls framer-motion, and it renders in the root layout —
 * so importing it eagerly put ~114 KB of animation library on the critical
 * path of every page, /privacy and /404 included, for a button in the corner
 * that most visitors never press.
 *
 * So: nothing is fetched until the browser is idle, and any real interaction
 * pulls it forward so the launcher is never missing when someone reaches for
 * it. The button is not part of first paint either way, so appearing a beat
 * late costs nothing.
 */
const ChatbotWidget = dynamic(() => import('./ChatbotWidget'), { ssr: false });

const IDLE_TIMEOUT_MS = 2500;

export function Chatbot() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    let idle = 0;
    let timer = 0;
    const start = () => setLoad(true);

    // Any of these means a person is here and about to do something.
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
    for (const e of events) window.addEventListener(e, start, { once: true, passive: true });

    // Safari only shipped requestIdleCallback in 16.4; a timeout is the
    // fallback. Read off a widened alias so `in` doesn't narrow window to
    // `never` in the else branch.
    const w = window as Window & {
      requestIdleCallback?: typeof requestIdleCallback;
      cancelIdleCallback?: typeof cancelIdleCallback;
    };
    if (typeof w.requestIdleCallback === 'function') {
      idle = w.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS });
    } else {
      timer = window.setTimeout(start, IDLE_TIMEOUT_MS);
    }

    return () => {
      for (const e of events) window.removeEventListener(e, start);
      if (idle) w.cancelIdleCallback?.(idle);
      if (timer) clearTimeout(timer);
    };
  }, [load]);

  return load ? <ChatbotWidget /> : null;
}
