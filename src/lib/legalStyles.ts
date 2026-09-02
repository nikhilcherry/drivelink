import type { CSSProperties } from 'react';

/**
 * Prose typography for /privacy and /terms. These pages are plain text, so
 * they borrow the inline-style pattern used by /v2v-communication rather than
 * earning their own CSS block.
 */
export const legalP: CSSProperties = { color: 'var(--fg2)', fontSize: '1rem', lineHeight: 1.75, margin: '0 0 18px' };
export const legalH2: CSSProperties = { fontSize: 'clamp(1.3rem, 2.2vw, 1.7rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '48px 0 14px' };
export const legalLi: CSSProperties = { color: 'var(--fg2)', fontSize: '1rem', lineHeight: 1.75, margin: '0 0 10px' };
