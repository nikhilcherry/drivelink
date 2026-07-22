'use client';
import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    num: '01 / 04', title: 'Read vehicle state',
    body: 'DriveLink reads core telemetry — speed, steering angle, brake pressure, lateral acceleration — directly from the vehicle bus. The on-vehicle module ingests this stream at 100Hz.',
    props: ['100 Hz · CAN/Ethernet', '12 bus signals', '<2 ms ingest'],
  },
  {
    num: '02 / 04', title: 'Predict short-window trajectory',
    body: 'The prediction engine generates a probabilistic trajectory cone for the next 0.8 to 1.5 seconds. It learns from local driving patterns and refines online as the vehicle moves.',
    props: ['0.8–1.5 s window', 'Probabilistic cone', 'On-device inference'],
  },
  {
    num: '03 / 04', title: 'Broadcast intent',
    body: 'The vehicle\'s predicted motion and current intent — lane change, brake, merge — are packed into a small DriveLink message and broadcast to nearby vehicles over the mesh.',
    props: ['<256 B payload', 'Sub-50 ms latency', 'drv-mesh protocol'],
  },
  {
    num: '04 / 04', title: 'Receive, fuse, react',
    body: 'Receiving vehicles fuse incoming intent with their own perception and adjust planning before danger appears. The result: smoother merges, no brake-waves, fewer blind-spot collisions.',
    props: ['Cooperative planning', 'Conflict-zone alerts', 'Cross-OEM ready'],
  },
];

export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const t = trackRef.current;
      if (!t) return;
      const rect = t.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = t.offsetHeight - vh;
      const passed = -rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      const idx = Math.min(3, Math.floor(p * 4 + 0.0001));
      setStep(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="how-it-works" className="dlw-howitworks">
      <div className="dlw-section-head center" style={{ paddingTop: 100, marginBottom: 0 }}>
        <div className="dlw-eyebrow"><span className="num">02</span> How it works</div>
        <h2 className="dlw-section-title">
          Four steps. <span className="dlw-text-gradient">Under fifty milliseconds.</span>
        </h2>
        <p className="dlw-section-sub">From sensor read to broadcast intent — the full DriveLink pipeline, end to end.</p>
      </div>

      <div ref={trackRef} className="dlw-hiw-track">
        <div className="dlw-hiw-sticky">
          <div className="dlw-hiw-grid">
            <div className="dlw-hiw-text">
              {steps.map((s, i) => (
                <div key={i} className={'dlw-hiw-step ' + (i === step ? 'is-active' : '')}>
                  <div className="num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <div className="props">
                    {s.props.map((p, j) => (
                      <div key={j}><b>{p.split(' ')[0]}</b> {p.split(' ').slice(1).join(' ')}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="dlw-hiw-stage">
              <div className="stage-label dlw-mono">STAGE · STEP {String(step + 1).padStart(2, '0')}</div>
              <HiwStage step={step} />
            </div>
          </div>

          <div className="dlw-hiw-progress">
            {steps.map((_, i) => (
              <div key={i} className={'dlw-hiw-progress-dot ' + (i === step ? 'is-active' : '')} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HiwStage({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 600 450" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="hiwGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(15,76,129,0.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id="hiwPkt" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(15,76,129,1)" />
          <stop offset="100%" stopColor="rgba(15,76,129,0)" />
        </radialGradient>
      </defs>
      <rect width="600" height="450" fill="url(#hiwGrid)" />

      {step === 0 && (
        <g>
          <g transform="translate(340 240)">
            <rect x="-50" y="-26" width="100" height="52" rx="14" fill="#0F4C81" />
            <rect x="-24" y="-18" width="40" height="36" rx="5" fill="rgba(255,255,255,0.7)" />
            <rect x="40" y="-18" width="6" height="36" rx="2" fill="rgba(255,255,255,0.9)" />
            {[0,1,2,3,4].map(i => (
              <g key={i} transform={`translate(0, ${-90 + i*24})`}>
                <line x1="-110" y1="0" x2="-50" y2="0" stroke="rgba(15,76,129,0.4)" strokeDasharray="2 4" strokeWidth="1">
                  <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
                </line>
                <text x="-115" y="3" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="end" fill="#6b7280">{['SPD','STR','BRK','ACC','YAW'][i]}</text>
              </g>
            ))}
          </g>
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#9ca3af" letterSpacing="2">READING BUS · 100 Hz</text>
        </g>
      )}

      {step === 1 && (
        <g>
          <g transform="translate(180 240)">
            <rect x="-30" y="-15" width="60" height="30" rx="10" fill="#0F4C81" />
            <rect x="-14" y="-10" width="22" height="20" rx="3" fill="rgba(255,255,255,0.7)" />
          </g>
          <path d="M 210 240 Q 320 220, 460 215 L 460 265 Q 320 260, 210 240 Z" fill="rgba(15,76,129,0.1)" stroke="rgba(15,76,129,0.3)" strokeDasharray="3 4" />
          <path d="M 210 240 Q 340 240, 450 240" stroke="#0F4C81" strokeWidth="1.5" strokeDasharray="2 6" fill="none" />
          {[0.4, 0.8, 1.2].map((t, i) => (
            <g key={i}>
              <circle cx={210 + (450 - 210) * t / 1.2} cy={240 - (i*4)} r="3" fill="#0F4C81" />
              <text x={210 + (450 - 210) * t / 1.2} y={290} fontSize="9" fontFamily="ui-monospace, monospace" fill="#6b7280" textAnchor="middle">{t}s</text>
            </g>
          ))}
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#9ca3af" letterSpacing="2">PROBABILISTIC CONE · 1.2 s</text>
        </g>
      )}

      {step === 2 && (
        <g>
          <g transform="translate(300 240)">
            <rect x="-30" y="-15" width="60" height="30" rx="10" fill="#0F4C81" />
            <rect x="-14" y="-10" width="22" height="20" rx="3" fill="rgba(255,255,255,0.7)" />
            {[0,1,2].map(i => (
              <circle key={i} r="40" fill="none" stroke="#0F4C81" strokeWidth="1.5" opacity="0.5">
                <animate attributeName="r" from="32" to="180" dur="2.5s" begin={`${i*0.8}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" begin={`${i*0.8}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
          {[[120,150],[480,150],[120,330],[480,330]].map(([x,y],i)=>(
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="14" fill="rgba(15,76,129,0.1)" stroke="rgba(15,76,129,0.3)" />
              <circle r="4" fill="#0F4C81" />
            </g>
          ))}
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#9ca3af" letterSpacing="2">BROADCAST · 244 B · drv-mesh</text>
        </g>
      )}

      {step === 3 && (
        <g>
          {[
            {x:160,y:170,id:'DRV-1'},{x:300,y:140,id:'DRV-2'},{x:440,y:170,id:'DRV-3'},
            {x:160,y:300,id:'DRV-4'},{x:300,y:330,id:'DRV-5'},{x:440,y:300,id:'DRV-6'},
          ].map((v,i)=>(
            <g key={i} transform={`translate(${v.x} ${v.y})`}>
              <rect x="-22" y="-11" width="44" height="22" rx="7" fill={i===2?'#fb923c':'#0F4C81'} opacity={i===2?1:0.85} />
              <rect x="-10" y="-7" width="16" height="14" rx="2" fill="rgba(255,255,255,0.7)" />
              <text y="32" textAnchor="middle" fontSize="8" fontFamily="ui-monospace, monospace" fill="#6b7280">{v.id}</text>
            </g>
          ))}
          {[
            [160,170,300,140],[300,140,440,170],[160,170,160,300],[160,300,300,330],
            [300,330,440,300],[440,170,440,300],[300,140,300,330],[160,170,300,330],[440,170,300,330]
          ].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(15,76,129,0.25)" strokeWidth="1" strokeDasharray="3 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="3s" repeatCount="indefinite" />
            </line>
          ))}
          <circle cx="440" cy="170" r="30" fill="none" stroke="rgba(251,146,60,0.6)" strokeWidth="1.5" strokeDasharray="3 3">
            <animate attributeName="r" from="26" to="38" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#9ca3af" letterSpacing="2">COOP MESH · 6 VEHICLES · 1 ALERT</text>
        </g>
      )}
    </svg>
  );
}
