'use client';
import { useRef, useState, useEffect } from 'react';

const milestones = [
  { date: 'Completed', title: 'Ideation & Concept Validation', status: 'completed', details: ['Foundational research', 'OEM problem mapping'] },
  { date: 'Completed', title: 'Strategic Mentorship', status: 'completed', details: ['PedalStart validation', 'NMIT support'] },
  { date: 'Completed', title: 'Autonomous Stack v1.0', status: 'completed', details: ['Core prediction software', 'System architecture fixed'] },
  { date: 'Completed', title: 'AIR 5 · IIT Delhi', status: 'completed', details: ['National validation', 'Patent grant option'] },
  { date: 'Q3 2026', title: 'Alpha Pilot Program', status: 'upcoming', details: ['OEM partner integration', 'Hardware-in-the-loop tests'] },
  { date: 'Q4 2026', title: 'Decentralized Data Node v1', status: 'upcoming', details: ['Initial node launch', 'Secure data verification'] },
  { date: 'Q1 2027', title: 'DRV Token Protocol Audit', status: 'upcoming', details: ['Incentive-layer security', 'Smart-contract validation'] },
  { date: 'Nov 2027', title: 'Cross-OEM Standardization', status: 'upcoming', details: ['Scale to global fleets', 'v1.0 protocol freeze'] },
];

export function RoadmapSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="roadmap" ref={containerRef} className="dlw-roadmap">
      <div className="dlw-container">
        <div className="dlw-roadmap-head">
          <div className="dlw-eyebrow" style={{ color: 'rgba(96,165,250,0.7)' }}>
            <span className="num" style={{ background: '#3b82f6' }}>06</span> Roadmap
          </div>
          <h2 className="dlw-roadmap-display">
            The <span className="dlw-text-gradient-down">Roadmap</span>
          </h2>
          <div className="dlw-roadmap-sub">Strategic evolution of V2V intelligence</div>
        </div>

        <div className="dlw-roadmap-timeline">
          <div className="dlw-roadmap-axis">
            <div className="dlw-roadmap-axis-fill" style={{ height: `${progress * 100}%` }} />
            <div className="dlw-roadmap-axis-tip" style={{ top: `${progress * 100}%` }} />
          </div>

          {milestones.map((m, i) => (
            <div key={i} className={'dlw-roadmap-row ' + (i % 2 === 0 ? 'left' : 'right')}>
              <div className="dlw-roadmap-card">
                <div className="head">
                  <span className="date">{m.date}</span>
                  <span className={'status-dot ' + (m.status === 'completed' ? 'done' : 'pending')} />
                </div>
                <h3>{m.title}</h3>
                <div className="tags">
                  {m.details.map((d, j) => <span key={j} className="tag">{d}</span>)}
                </div>
              </div>
              <div className={'dlw-roadmap-dot ' + (m.status === 'completed' ? 'done' : '')} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
