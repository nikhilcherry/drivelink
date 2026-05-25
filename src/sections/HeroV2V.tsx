'use client';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

type Page = 'home' | 'product' | 'team' | 'investors';

interface HeroProps {
  onCTA: (target: Page) => void;
}

export function HeroV2V({ onCTA }: HeroProps) {
  return (
    <section className="dlw-hero">
      <div className="dlw-hero-bg-grid" />
      <div className="dlw-container dlw-hero-wrap">
        <div className="dlw-hero-top">
          <div className="dlw-hero-chip">
            <span className="pulse-ring"><span className="core" /></span>
            <span>Automotive AI Infrastructure</span>
            <span className="dlw-mono" style={{ color: 'var(--fg4)', fontSize: 11 }}>· v0.1</span>
          </div>

          <h1 className="dlw-hero-title">
            DriveLink: The{' '}
            <span className="dlw-text-gradient">Decentralized Backbone</span>
            {' '}for Automotive AI
          </h1>

          <p className="dlw-hero-sub">
            &ldquo;Connecting OEMs, Data, and Intelligence via a low-latency, intent-first protocol.&rdquo;
          </p>

          <div className="dlw-hero-ctas">
            <button className="dlw-btn dlw-btn-primary" onClick={() => onCTA('product')}>
              Explore Technology
              <ArrowRight size={16} />
            </button>
            <button className="dlw-btn dlw-btn-ghost" onClick={() => onCTA('investors')}>
              View Roadmap
            </button>
          </div>
        </div>

        <V2VSimulation />
      </div>
    </section>
  );
}

function V2VSimulation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setPhase((p) => (p + 1) % 360), 50);
    return () => clearInterval(i);
  }, []);

  const t = phase / 360;
  const ax = 120 + t * 760;
  const ay = 280 + Math.sin(t * Math.PI * 2) * 24;
  const t2 = (t + 0.5) % 1;
  const bx = 120 + t2 * 760;
  const by = 360 + Math.sin(t2 * Math.PI * 2 + Math.PI) * 24;

  const speedA = 64 + Math.round(Math.sin(t * Math.PI * 4) * 6);
  const speedB = 58 + Math.round(Math.cos(t * Math.PI * 4) * 5);
  const latency = 38 + Math.round(Math.sin(t * Math.PI * 6) * 8);

  return (
    <div className="dlw-hero-stage" aria-hidden="true">
      <div className="corner-label tl">
        <span className="dot" /> <span className="num">LIVE</span> · Bangalore Mesh Node
      </div>
      <div className="corner-label tr">
        <span className="num">{latency}ms</span> · avg V2V latency
      </div>
      <div className="corner-label bl">4 vehicles · 12 intents/sec</div>
      <div className="corner-label br">Protocol v0.1 · drv-mesh</div>

      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="laneA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(15,76,129,0)" />
            <stop offset="50%" stopColor="rgba(15,76,129,0.25)" />
            <stop offset="100%" stopColor="rgba(15,76,129,0)" />
          </linearGradient>
          <linearGradient id="laneB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(15,76,129,0)" />
            <stop offset="50%" stopColor="rgba(15,76,129,0.18)" />
            <stop offset="100%" stopColor="rgba(15,76,129,0)" />
          </linearGradient>
          <radialGradient id="packet" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(15,76,129,1)" />
            <stop offset="60%" stopColor="rgba(15,76,129,0.4)" />
            <stop offset="100%" stopColor="rgba(15,76,129,0)" />
          </radialGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <pattern id="roadDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(15,76,129,0.08)" />
          </pattern>
        </defs>

        <rect width="1000" height="600" fill="url(#roadDots)" />
        <path d="M 60 280 Q 500 220, 940 280" stroke="url(#laneA)" strokeWidth="44" fill="none" strokeLinecap="round" />
        <path d="M 60 360 Q 500 420, 940 360" stroke="url(#laneB)" strokeWidth="44" fill="none" strokeLinecap="round" />
        <path d="M 60 280 Q 500 220, 940 280" stroke="rgba(15,76,129,0.35)" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />
        <path d="M 60 360 Q 500 420, 940 360" stroke="rgba(15,76,129,0.25)" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />

        <PredictedCone x={ax} y={ay} dir={1} />
        <PredictedCone x={bx} y={by} dir={1} />
        <IntentPackets phase={phase} ax={ax} ay={ay} bx={bx} by={by} />
        <Car x={ax} y={ay} color="#0F4C81" />
        <Car x={bx} y={by} color="#1E3A8A" rotate={180} />
        <ConflictZone ax={ax} ay={ay} bx={bx} by={by} />
      </svg>

      <CarHUD x={ax} y={ay} stageW={1000} stageH={600} id="DRV-A1" speed={speedA} intent="Lane change ←" />
      <CarHUD x={bx} y={by} stageW={1000} stageH={600} id="DRV-B7" speed={speedB} intent="Hold lane" />
    </div>
  );
}

function Car({ x, y, color, rotate = 0 }: { x: number; y: number; color: string; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <ellipse cx="0" cy="14" rx="28" ry="5" fill="rgba(15,76,129,0.18)" filter="url(#softShadow)" />
      <rect x="-26" y="-13" width="52" height="26" rx="9" fill={color} />
      <rect x="-12" y="-9" width="20" height="18" rx="3" fill="rgba(255,255,255,0.7)" />
      <rect x="22" y="-9" width="2" height="18" rx="1" fill="rgba(255,255,255,0.9)" />
      <rect x="-22" y="-15" width="8" height="3" rx="1" fill="#0a0a0a" />
      <rect x="14" y="-15" width="8" height="3" rx="1" fill="#0a0a0a" />
      <rect x="-22" y="12" width="8" height="3" rx="1" fill="#0a0a0a" />
      <rect x="14" y="12" width="8" height="3" rx="1" fill="#0a0a0a" />
      <circle r="38" fill="none" stroke={color} strokeWidth="1" opacity="0.25">
        <animate attributeName="r" from="32" to="56" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function PredictedCone({ x, y, dir }: { x: number; y: number; dir: number }) {
  const len = 90;
  return (
    <g opacity="0.8">
      <path d={`M ${x} ${y} Q ${x + len * dir * 0.5} ${y - 6}, ${x + len * dir} ${y - 14}`} stroke="rgba(15,76,129,0.5)" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      <path d={`M ${x} ${y} Q ${x + len * dir * 0.5} ${y + 6}, ${x + len * dir} ${y + 14}`} stroke="rgba(15,76,129,0.5)" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      <circle cx={x + len * dir} cy={y} r="2" fill="rgba(15,76,129,0.5)" />
    </g>
  );
}

function IntentPackets({ phase, ax, ay, bx, by }: { phase: number; ax: number; ay: number; bx: number; by: number }) {
  const packets = [0, 1, 2].map((i) => {
    const local = ((phase / 360) + i * 0.33) % 1;
    const t = local;
    const cx = (ax + bx) / 2;
    const cy = (ay + by) / 2 - 100;
    const px = (1 - t) ** 2 * ax + 2 * (1 - t) * t * cx + t ** 2 * bx;
    const py = (1 - t) ** 2 * ay + 2 * (1 - t) * t * cy + t ** 2 * by;
    const opacity = Math.sin(t * Math.PI);
    return <circle key={i} cx={px} cy={py} r="6" fill="url(#packet)" opacity={opacity} />;
  });
  return (
    <g>
      <path d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${(ay + by) / 2 - 100}, ${bx} ${by}`} stroke="rgba(15,76,129,0.18)" strokeWidth="1" strokeDasharray="2 6" fill="none" />
      {packets}
    </g>
  );
}

function ConflictZone({ ax, ay, bx, by }: { ax: number; ay: number; bx: number; by: number }) {
  const dist = Math.hypot(ax - bx, ay - by);
  if (dist > 200) return null;
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  return (
    <g>
      <circle cx={mx} cy={my} r="22" fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.5)" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="r" from="18" to="28" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <text x={mx} y={my - 30} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="#c2410c" fontWeight="700" letterSpacing="0.1em">CONFLICT</text>
    </g>
  );
}

function CarHUD({ x, y, stageW, stageH, id, speed, intent }: { x: number; y: number; stageW: number; stageH: number; id: string; speed: number; intent: string }) {
  const left = (x / stageW) * 100;
  const top = (y / stageH) * 100;
  return (
    <div className="dlw-car-hud" style={{ left: `${left}%`, top: `calc(${top}% - 28px)` }}>
      <div className="id">{id}</div>
      <div className="row">
        <span>{speed} km/h</span> · <span>{intent}</span>
      </div>
    </div>
  );
}
