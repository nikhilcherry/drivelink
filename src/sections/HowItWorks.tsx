'use client';
import { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, Radio, Share2, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    num: '01 / 04',
    badge: 'STAGE 01',
    title: 'Read vehicle state',
    body: 'DriveLink reads core telemetry — speed, steering angle, brake pressure, lateral acceleration — directly from the vehicle bus. The on-vehicle module ingests this stream at 100Hz.',
    props: ['100 Hz · CAN/Ethernet', '12 bus signals', '<2 ms ingest'],
    icon: Activity,
    method: 'CAN · BUS',
    route: '/dev/can0 · 100Hz',
    status: 'INGESTING',
  },
  {
    num: '02 / 04',
    badge: 'STAGE 02',
    title: 'Predict short-window trajectory',
    body: 'The prediction engine generates a probabilistic trajectory cone for the next 0.8 to 1.5 seconds. It learns from local driving patterns and refines online as the vehicle moves.',
    props: ['0.8–1.5 s window', 'Probabilistic cone', 'On-device inference'],
    icon: Cpu,
    method: 'ONNX · INT8',
    route: 'model://trajectory-cone',
    status: '<12ms LATENCY',
  },
  {
    num: '03 / 04',
    badge: 'STAGE 03',
    title: 'Broadcast intent',
    body: 'The vehicle\'s predicted motion and current intent — lane change, brake, merge — are packed into a small DriveLink message and broadcast to nearby vehicles over the mesh.',
    props: ['<256 B payload', 'Sub-50 ms latency', 'drv-mesh protocol'],
    icon: Radio,
    method: 'MESH · UDP',
    route: 'drv-mesh://broadcast:8765',
    status: 'ACTIVE MESH',
  },
  {
    num: '04 / 04',
    badge: 'STAGE 04',
    title: 'Receive, fuse, react',
    body: 'Receiving vehicles fuse incoming intent with their own perception and adjust planning before danger appears. The result: smoother merges, no brake-waves, fewer blind-spot collisions.',
    props: ['Cooperative planning', 'Conflict-zone alerts', 'Cross-OEM ready'],
    icon: Share2,
    method: 'FUSION · V2V',
    route: 'safety://coop-planner',
    status: '0 CONFLICTS',
  },
];

export function HowItWorks() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches); // eslint-disable-line react-hooks/set-state-in-effect -- initial sync
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Smooth physical card-stack overlap & scale depth
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const cards = cardsRef.current;
        for (let i = 0; i < cards.length - 1; i++) {
          const curr = cards[i];
          const next = cards[i + 1];
          if (!curr || !next) continue;
          const currRect = curr.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();

          // When the next card scrolls up and begins overlapping the current sticky card
          const overlap = currRect.bottom - nextRect.top;
          if (overlap > 0) {
            const progress = Math.min(1, Math.max(0, overlap / (currRect.height * 0.85)));
            const scale = 1 - progress * 0.04;
            const brightness = 1 - progress * 0.16;
            curr.style.transform = `scale(${scale.toFixed(4)})`;
            curr.style.filter = `brightness(${brightness.toFixed(3)})`;
          } else {
            curr.style.transform = 'scale(1)';
            curr.style.filter = 'brightness(1)';
          }
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduceMotion]);

  return (
    <section id="how-it-works" className="dlw-howitworks">
      <div className="dlw-section-head center" style={{ paddingTop: 100, marginBottom: 0 }}>
        <div className="dlw-eyebrow"><span className="num">02</span> How it works</div>
        <h2 className="dlw-section-title">
          Four steps. <span className="dlw-text-gradient">Under fifty milliseconds.</span>
        </h2>
        <p className="dlw-section-sub">From sensor read to broadcast intent — the full DriveLink pipeline, end to end.</p>
      </div>

      <div className="dlw-hiw-stack">
        {steps.map((s, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="dlw-hiw-card"
            style={{
              '--card-index': i,
              zIndex: i + 1,
            } as React.CSSProperties}
          >
            <div className="dlw-hiw-card-inner">
              <div className="dlw-hiw-card-info">
                <div className="dlw-hiw-card-header">
                  <div className="dlw-hiw-card-icon" aria-hidden="true">
                    <s.icon size={20} />
                  </div>
                  <span className="dlw-hiw-card-badge">{s.badge}</span>
                  <span className="dlw-hiw-card-num">{s.num}</span>
                </div>

                <h3 className="dlw-hiw-card-title">{s.title}</h3>
                <p className="dlw-hiw-card-body">{s.body}</p>

                <div className="dlw-hiw-card-props">
                  {s.props.map((p, j) => (
                    <div key={j} className="dlw-hiw-card-prop">
                      <CheckCircle2 size={14} className="dlw-hiw-prop-check" aria-hidden="true" />
                      <span><b>{p.split(' ')[0]}</b> {p.split(' ').slice(1).join(' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dlw-hiw-card-visual">
                <div className="dlw-hiw-terminal">
                  <div className="dlw-hiw-terminal-bar">
                    <div className="dlw-terminal-dots" aria-hidden="true">
                      <span className="dot red" />
                      <span className="dot yellow" />
                      <span className="dot green" />
                    </div>
                    <span className="dlw-terminal-method">{s.method}</span>
                    <span className="dlw-terminal-route">{s.route}</span>
                    <span className="dlw-terminal-status">{s.status}</span>
                  </div>
                  <div className="dlw-hiw-terminal-body">
                    <HiwStage step={i} reduceMotion={reduceMotion} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HiwStage({ step, reduceMotion }: { step: number; reduceMotion: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (reduceMotion) {
      svg.pauseAnimations();
    } else {
      svg.unpauseAnimations();
    }
  }, [reduceMotion]);

  const gridId = `hiwGrid-${step}`;
  const pktId = `hiwPkt-${step}`;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 450"
      preserveAspectRatio="xMidYMid meet"
      className="dlw-hiw-svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={gridId} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id={pktId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(56,189,248,1)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
      </defs>
      <rect width="600" height="450" fill={`url(#${gridId})`} />

      {step === 0 && (
        <g>
          <g transform="translate(340 240)">
            <rect x="-50" y="-26" width="100" height="52" rx="14" fill="#0F4C81" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
            <rect x="-24" y="-18" width="40" height="36" rx="5" fill="rgba(255,255,255,0.7)" />
            <rect x="40" y="-18" width="6" height="36" rx="2" fill="rgba(255,255,255,0.9)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(0, ${-90 + i * 24})`}>
                <line x1="-110" y1="0" x2="-50" y2="0" stroke="rgba(56,189,248,0.5)" strokeDasharray="2 4" strokeWidth="1">
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
                </line>
                <text x="-115" y="3" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="end" fill="#94a3b8">
                  {['SPD', 'STR', 'BRK', 'ACC', 'YAW'][i]}
                </text>
              </g>
            ))}
          </g>
          <text x="300" y="426" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#94a3b8" letterSpacing="2">
            READING BUS · 100 Hz
          </text>
        </g>
      )}

      {step === 1 && (
        <g>
          <g transform="translate(180 240)">
            <rect x="-30" y="-15" width="60" height="30" rx="10" fill="#0F4C81" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
            <rect x="-14" y="-10" width="22" height="20" rx="3" fill="rgba(255,255,255,0.7)" />
          </g>
          <path d="M 210 240 Q 320 220, 460 215 L 460 265 Q 320 260, 210 240 Z" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.35)" strokeDasharray="3 4" />
          <path d="M 210 240 Q 340 240, 450 240" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 6" fill="none">
            <animate attributeName="stroke-dashoffset" from="0" to="-200" dur="2s" repeatCount="indefinite" />
          </path>
          {[0.4, 0.8, 1.2].map((t, i) => (
            <g key={i}>
              <circle cx={210 + ((450 - 210) * t) / 1.2} cy={240 - i * 4} r="3.5" fill="#38bdf8">
                <animate attributeName="opacity" from="0.4" to="1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x={210 + ((450 - 210) * t) / 1.2} y={290} fontSize="9" fontFamily="ui-monospace, monospace" fill="#94a3b8" textAnchor="middle">
                {t}s
              </text>
            </g>
          ))}
          <text x="300" y="426" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#94a3b8" letterSpacing="2">
            PROBABILISTIC CONE · 1.2 s
          </text>
        </g>
      )}

      {step === 2 && (
        <g>
          <g transform="translate(300 240)">
            <rect x="-30" y="-15" width="60" height="30" rx="10" fill="#0F4C81" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
            <rect x="-14" y="-10" width="22" height="20" rx="3" fill="rgba(255,255,255,0.7)" />
            {[0, 1, 2].map((i) => (
              <circle key={i} r="40" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" from="32" to="180" dur="2.5s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="2.5s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
          {[[120, 150], [480, 150], [120, 330], [480, 330]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="14" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.4)" />
              <circle r="4" fill="#38bdf8" />
            </g>
          ))}
          <text x="300" y="426" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#94a3b8" letterSpacing="2">
            BROADCAST · 244 B · drv-mesh
          </text>
        </g>
      )}

      {step === 3 && (
        <g>
          {[
            { x: 160, y: 170, id: 'DRV-1' },
            { x: 300, y: 140, id: 'DRV-2' },
            { x: 440, y: 170, id: 'DRV-3' },
            { x: 160, y: 300, id: 'DRV-4' },
            { x: 300, y: 330, id: 'DRV-5' },
            { x: 440, y: 300, id: 'DRV-6' },
          ].map((v, i) => (
            <g key={i} transform={`translate(${v.x} ${v.y})`}>
              <rect x="-22" y="-11" width="44" height="22" rx="7" fill={i === 2 ? '#f97316' : '#0F4C81'} stroke={i === 2 ? '#fb923c' : 'rgba(56,189,248,0.4)'} strokeWidth="1" />
              <rect x="-10" y="-7" width="16" height="14" rx="2" fill="rgba(255,255,255,0.7)" />
              <text y="32" textAnchor="middle" fontSize="8" fontFamily="ui-monospace, monospace" fill="#94a3b8">
                {v.id}
              </text>
            </g>
          ))}
          {[
            [160, 170, 300, 140],
            [300, 140, 440, 170],
            [160, 170, 160, 300],
            [160, 300, 300, 330],
            [300, 330, 440, 300],
            [440, 170, 440, 300],
            [300, 140, 300, 330],
            [160, 170, 300, 330],
            [440, 170, 300, 330],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(56,189,248,0.3)" strokeWidth="1" strokeDasharray="3 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="3s" repeatCount="indefinite" />
            </line>
          ))}
          <circle cx="440" cy="170" r="30" fill="none" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" strokeDasharray="3 3">
            <animate attributeName="r" from="26" to="38" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="300" y="426" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#94a3b8" letterSpacing="2">
            COOP MESH · 6 VEHICLES · 1 ALERT
          </text>
        </g>
      )}
    </svg>
  );
}