'use client';
import type { ReactNode } from 'react';

/** Shared page shell for the legal routes (/privacy, /terms). */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <div className="dlw-container" style={{ maxWidth: 760 }}>
          <div className="dlw-section-head">
            <div className="dlw-eyebrow"><span className="num">§</span> {eyebrow}</div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{title}</h1>
            <p className="dlw-section-sub">{intro}</p>
            <p className="dlw-mono" style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 8 }}>Last updated {updated}</p>
          </div>
          <article>{children}</article>
        </div>
      </section>
    </main>
  );
}
