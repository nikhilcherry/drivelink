'use client';
import { useRef, useState, useEffect } from 'react';
import { Lightbulb, Users, Cpu, Trophy, Rocket, Boxes, ShieldCheck, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Milestone {
  date: string;
  title: string;
  status: 'completed' | 'upcoming';
  details: string[];
  Icon: LucideIcon;
}

// TODO(founder): confirm roadmap items + dates. Order: completed milestones first, then
// upcoming quarters ascending (Q3 2026 → Q4 2026 → Q1 2027 → Nov 2027). Keep status one of
// 'completed' | 'upcoming' and quarter labels in the "Q# YYYY" / "Mon YYYY" format.
const milestones: Milestone[] = [
  { date: 'Completed', title: 'Ideation & Concept Validation', status: 'completed', Icon: Lightbulb, details: ['Foundational research', 'OEM problem mapping'] },
  { date: 'Completed', title: 'Strategic Mentorship', status: 'completed', Icon: Users, details: ['PedalStart validation', 'NMIT support'] },
  { date: 'Completed', title: 'Autonomous Stack v1.0', status: 'completed', Icon: Cpu, details: ['Core prediction software', 'System architecture fixed'] },
  { date: 'Completed', title: 'AIR 5 · IIT Delhi', status: 'completed', Icon: Trophy, details: ['National validation', 'Patent grant option'] },
  { date: 'Q3 2026', title: 'Alpha Pilot Program', status: 'upcoming', Icon: Rocket, details: ['OEM partner integration', 'Hardware-in-the-loop tests'] },
  { date: 'Q4 2026', title: 'Decentralized Data Node v1', status: 'upcoming', Icon: Boxes, details: ['Initial node launch', 'Secure data verification'] },
  { date: 'Q1 2027', title: 'DRV Token Protocol Audit', status: 'upcoming', Icon: ShieldCheck, details: ['Incentive-layer security', 'Smart-contract validation'] },
  { date: 'Nov 2027', title: 'Cross-OEM Standardization', status: 'upcoming', Icon: Globe, details: ['Scale to global fleets', 'v1.0 protocol freeze'] },
];

const completedCount = milestones.filter((m) => m.status === 'completed').length;
const currentIndex = milestones.findIndex((m) => m.status === 'upcoming');

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
      {/* unrolled-blueprint "paper roll" framing */}
      <div className="dlw-roadmap-curl" aria-hidden="true" />
      <div className="dlw-roadmap-roll top" aria-hidden="true" />
      <div className="dlw-roadmap-roll bottom" aria-hidden="true" />
      <div className="dlw-container">
        <div className="dlw-roadmap-head">
          <div className="dlw-eyebrow" style={{ color: 'rgba(96,165,250,0.7)' }}>
            <span className="num" style={{ background: '#3b82f6' }}>06</span> Roadmap
          </div>
          <h2 className="dlw-roadmap-display">
            The <span className="dlw-text-gradient-down">Roadmap</span>
          </h2>
          <div className="dlw-roadmap-sub">Strategic evolution of V2V intelligence</div>
          <div className="dlw-roadmap-progress">
            <span className="lbl dlw-mono">{completedCount} / {milestones.length} shipped</span>
            <span className="bar"><i style={{ width: `${(completedCount / milestones.length) * 100}%` }} /></span>
          </div>
        </div>

        <div className="dlw-roadmap-timeline">
          <div className="dlw-roadmap-axis">
            <div className="dlw-roadmap-axis-fill" style={{ height: `${progress * 100}%` }} />
            <div className="dlw-roadmap-axis-tip" style={{ top: `${progress * 100}%` }} />
          </div>

          {milestones.map((m, i) => {
            const isCurrent = i === currentIndex;
            const state = m.status === 'completed' ? 'done' : isCurrent ? 'current' : 'pending';
            return (
              <div key={i} className={'dlw-roadmap-row ' + (i % 2 === 0 ? 'left' : 'right')}>
                <div className={'dlw-roadmap-card' + (isCurrent ? ' is-current' : '')}>
                  <span className="idx dlw-mono">{String(i + 1).padStart(2, '0')}</span>
                  <div className="head">
                    <span className="date">{m.date}</span>
                    <span className={'status-pill ' + state}>
                      {m.status === 'completed' ? 'Shipped' : isCurrent ? 'In progress' : 'Planned'}
                    </span>
                  </div>
                  <h3>{m.title}</h3>
                  <div className="tags">
                    {m.details.map((d, j) => <span key={j} className="tag">{d}</span>)}
                  </div>
                </div>
                <div className={'dlw-roadmap-node ' + state}>
                  <m.Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
