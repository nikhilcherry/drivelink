'use client';
import { useEffect, useRef, useState } from 'react';
import { Tag, Smartphone, MessageSquare } from 'lucide-react';

interface Step {
  Icon: typeof Tag;
  num: string;
  title: string;
  body: string;
  props: string[];
}

const steps: Step[] = [
  {
    Icon: Tag,
    num: '01',
    title: 'Apply the QR tag to your windshield',
    body: 'Peel-and-stick. Your personalised DriveLink Connect QR tag adheres to any windshield. It encodes a one-time, rotating link — not your phone number.',
    props: ['Permanent adhesive', 'Weatherproof vinyl', 'Rotating secure link'],
  },
  {
    Icon: Smartphone,
    num: '02',
    title: 'Stranger scans with any standard phone camera',
    body: 'No app download needed. iOS and Android camera apps open the anonymous chat session directly in the browser — instant, frictionless, zero barriers.',
    props: ['No app install', 'iOS & Android native', 'Opens in < 2 seconds'],
  },
  {
    Icon: MessageSquare,
    num: '03',
    title: 'Receive real-time private messages or preset alerts',
    body: 'You get a push notification to your phone. Reply via the DriveLink chat — the scanner never sees your number. Close the session when resolved.',
    props: ['Real-time push alert', 'Number never exposed', 'One-tap preset replies'],
  },
];

export function HowConnectWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  // rAF handle — kept in a ref so the cleanup always cancels the right frame
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      // Cancel any pending frame — only the last scroll position matters
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const t = trackRef.current;
        if (!t) return;
        const rect = t.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = t.offsetHeight - vh;
        const passed = -rect.top;
        const p = Math.max(0, Math.min(1, passed / total));
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length + 0.0001));
        // Skip setState if the step hasn't actually changed — avoids pointless
        // re-renders for the vast majority of scroll events
        setActiveStep((prev) => (prev === idx ? prev : idx));
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section id="how-connect-works" className="dlw-howitworks" aria-labelledby="hcw-heading">
      <div className="dlw-section-head center" style={{ paddingTop: 100, marginBottom: 0 }}>
        <div className="dlw-eyebrow">
          <span className="num">02</span> How it works
        </div>
        <h2 id="hcw-heading" className="dlw-section-title">
          Three steps.{' '}
          <span className="dlw-text-gradient">Completely private.</span>
        </h2>
        <p className="dlw-section-sub">
          From windshield tag to resolved parking issue — the full DriveLink Connect flow, end to end.
        </p>
      </div>

      <div ref={trackRef} className="dlw-hiw-track">
        <div className="dlw-hiw-sticky">
          <div className="dlw-hiw-grid">

            {/* ── Left: step text panels ── */}
            <div className="dlw-hiw-text">
              {steps.map((s, i) => (
                <div
                  key={i}
                  id={`hcw-step-${i}`}
                  className={'dlw-hiw-step ' + (i === activeStep ? 'is-active' : '')}
                  aria-current={i === activeStep ? 'step' : undefined}
                >
                  <div className="num">{s.num} / 0{steps.length}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <div className="props">
                    {s.props.map((prop, j) => {
                      const [first, ...rest] = prop.split(' ');
                      return (
                        <div key={j}>
                          <b>{first}</b> {rest.join(' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right: GPU-promoted visual stage ──
                The wrapper div gets `will-change: transform` so the browser
                promotes it to its own compositor layer. The stage SVGs are
                always rendered — we cross-fade between them via CSS opacity
                transitions rather than conditional rendering, which prevents
                the "flash to white" artefact caused by React remounting the
                SVG subtree on every step change.                              */}
            <div className="dlw-hiw-stage dlw-hcw-stage-wrap">
              <div className="stage-label dlw-mono">
                STAGE · STEP {String(activeStep + 1).padStart(2, '0')}
              </div>
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={'dlw-hcw-panel ' + (i === activeStep ? 'is-active' : '')}
                  aria-hidden={i !== activeStep}
                >
                  <HcwStage step={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Progress dots — aria-hidden; aria-current on steps carries semantics */}
          <div className="dlw-hiw-progress" aria-hidden="true">
            {steps.map((_, i) => (
              <div
                key={i}
                className={'dlw-hiw-progress-dot ' + (i === activeStep ? 'is-active' : '')}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── SVG stage per step ──────────────────── */

function HcwStage({ step }: { step: number }) {
  return (
    // Explicit width/height eliminate intrinsic-size ambiguity before CSS
    // paints — the viewBox still scales to 100% via the parent CSS rule.
    <svg
      viewBox="0 0 600 450"
      width="600"
      height="450"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Unique IDs scoped per step to avoid cross-panel gradient collisions */}
        <pattern id={`hcwGrid${step}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(15,76,129,0.055)" strokeWidth="1" />
        </pattern>
        <radialGradient id={`hcwGlow${step}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(15,76,129,0.14)" />
          <stop offset="100%" stopColor="rgba(15,76,129,0)" />
        </radialGradient>
      </defs>
      <rect width="600" height="450" fill={`url(#hcwGrid${step})`} />
      <ellipse cx="300" cy="225" rx="240" ry="180" fill={`url(#hcwGlow${step})`} />

      {/* ── Step 0: Apply QR tag ── */}
      {step === 0 && (
        <g>
          {/* Windshield silhouette */}
          <path
            d="M 120 360 L 80 180 Q 78 150 110 148 L 490 148 Q 522 150 520 180 L 480 360 Z"
            fill="rgba(219,234,254,0.5)"
            stroke="rgba(15,76,129,0.2)"
            strokeWidth="2"
          />
          {/* QR tag on windshield */}
          <g transform="translate(240 195)">
            <rect x="0" y="0" width="120" height="120" rx="14" fill="white" stroke="rgba(15,76,129,0.2)" strokeWidth="1.5" />
            {/* Finder pattern corners */}
            <rect x="8" y="8" width="32" height="32" rx="4" fill="none" stroke="#0F4C81" strokeWidth="2.5" />
            <rect x="13" y="13" width="22" height="22" rx="2" fill="#0F4C81" />
            <rect x="80" y="8" width="32" height="32" rx="4" fill="none" stroke="#0F4C81" strokeWidth="2.5" />
            <rect x="85" y="13" width="22" height="22" rx="2" fill="#0F4C81" />
            <rect x="8" y="80" width="32" height="32" rx="4" fill="none" stroke="#0F4C81" strokeWidth="2.5" />
            <rect x="13" y="85" width="22" height="22" rx="2" fill="#0F4C81" />
            {/* Data modules */}
            {[
              [48,8],[56,8],[64,8],
              [48,16],[64,16],
              [48,24],[56,24],[64,24],
              [48,32],[56,32],
              [48,40],[64,40],
              [8,48],[16,48],[24,48],[32,48],
              [48,48],[56,48],[80,48],[96,48],
              [8,56],[24,56],[48,56],[64,56],[72,56],
              [8,64],[16,64],[32,64],[48,64],[80,64],[96,64],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#0F4C81" opacity="0.7" />
            ))}
            <text x="60" y="114" textAnchor="middle" fontSize="8" fontFamily="ui-monospace, monospace" fill="rgba(15,76,129,0.55)" letterSpacing="0.03em">drivelink.tech</text>
          </g>
          {/* Peel arrow */}
          <defs>
            <marker id="hcwArrow0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0F4C81" />
            </marker>
          </defs>
          <path d="M 220 265 Q 200 240 188 220" stroke="#0F4C81" strokeWidth="1.5" strokeDasharray="3 4" fill="none" markerEnd="url(#hcwArrow0)" />
          <text x="174" y="215" fontSize="10" fontFamily="system-ui, sans-serif" fill="rgba(15,76,129,0.55)" textAnchor="middle">peel &amp; stick</text>
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#64748b" letterSpacing="2">WEATHERPROOF · ROTATING LINK</text>
        </g>
      )}

      {/* ── Step 1: Stranger scans ── */}
      {step === 1 && (
        <g>
          <g transform="translate(225 80)">
            <rect x="0" y="0" width="150" height="270" rx="24" fill="white" stroke="rgba(15,76,129,0.15)" strokeWidth="1.5" />
            <rect x="8" y="8" width="134" height="220" rx="18" fill="#f0f6ff" />
            {/* Notch */}
            <rect x="56" y="2" width="38" height="8" rx="4" fill="rgba(15,76,129,0.18)" />
            {/* Viewfinder */}
            <rect x="20" y="24" width="110" height="120" rx="10" fill="rgba(15,76,129,0.05)" stroke="rgba(15,76,129,0.15)" strokeWidth="1" />
            {/* Corner brackets */}
            <path d="M 30 32 L 22 32 L 22 40" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 120 32 L 128 32 L 128 40" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 30 136 L 22 136 L 22 128" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 120 136 L 128 136 L 128 128" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Scan line — CSS animation runs regardless of step visibility;
                placing it inside the conditionally-rendered step means it only
                runs when this panel is actually visible.                         */}
            <rect x="22" y="60" width="106" height="2" rx="1" fill="rgba(15,76,129,0.6)">
              <animate attributeName="y" from="30" to="138" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="2s" repeatCount="indefinite" />
            </rect>
            {/* Browser address bar */}
            <rect x="16" y="158" width="118" height="20" rx="6" fill="rgba(15,76,129,0.08)" />
            <text x="75" y="172" textAnchor="middle" fontSize="8.5" fontFamily="ui-monospace, monospace" fill="#0F4C81">drivelink.tech/c/xK92...</text>
            {/* "Opening…" */}
            <text x="75" y="204" textAnchor="middle" fontSize="10" fontFamily="system-ui, sans-serif" fill="#374151">Opening chat…</text>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={65 + i * 10} cy={218} r="3" fill="#0F4C81" opacity="0.6">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" begin={`${i * 0.33}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* Home bar */}
            <rect x="55" y="258" width="40" height="4" rx="2" fill="rgba(15,76,129,0.18)" />
          </g>
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#64748b" letterSpacing="2">NO APP INSTALL · ANY CAMERA APP</text>
        </g>
      )}

      {/* ── Step 2: Owner receives alert ── */}
      {step === 2 && (
        <g>
          {/* Notification banner */}
          <g transform="translate(130 60)">
            <rect x="0" y="0" width="340" height="76" rx="18" fill="white" stroke="rgba(15,76,129,0.12)" strokeWidth="1.5" />
            <rect x="16" y="16" width="44" height="44" rx="12" fill="#0F4C81" />
            <text x="38" y="44" textAnchor="middle" fontSize="22">🔔</text>
            <text x="76" y="32" fontSize="12" fontWeight="700" fill="#111827" fontFamily="system-ui, sans-serif">DriveLink Connect</text>
            <text x="76" y="48" fontSize="11" fill="#374151" fontFamily="system-ui, sans-serif">Someone scanned your tag</text>
            <text x="76" y="62" fontSize="10" fill="#64748b" fontFamily="system-ui, sans-serif">Tap to reply anonymously →</text>
            {/* Pulse rings */}
            {[0, 1, 2].map((i) => (
              <circle key={i} cx="38" cy="38" r="30" fill="none" stroke="#0F4C81" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" from="24" to="56" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* Chat thread */}
          <g transform="translate(130 160)">
            <rect x="0" y="0" width="340" height="220" rx="18" fill="white" stroke="rgba(15,76,129,0.12)" strokeWidth="1.5" />
            {/* Header */}
            <rect x="0" y="0" width="340" height="44" rx="18" fill="#0F4C81" />
            <rect x="0" y="24" width="340" height="20" fill="#0F4C81" />
            <text x="170" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">🔒 Anonymous Chat</text>
            <text x="170" y="32" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="ui-monospace, monospace">PHONE NUMBER NEVER VISIBLE</text>
            {/* Stranger bubble */}
            <g transform="translate(12 56)">
              <rect x="0" y="0" width="170" height="44" rx="12" fill="#f0f6ff" />
              <text x="10" y="16" fontSize="10" fill="#374151" fontFamily="system-ui, sans-serif">Your car is blocking</text>
              <text x="10" y="30" fontSize="10" fill="#374151" fontFamily="system-ui, sans-serif">my driveway — please move it!</text>
              <text x="175" y="42" fontSize="8.5" fill="#64748b" fontFamily="ui-monospace, monospace">now</text>
            </g>
            {/* Owner reply */}
            <g transform="translate(12 112)">
              <rect x="156" y="0" width="170" height="44" rx="12" fill="#0F4C81" />
              <text x="166" y="16" fontSize="10" fill="white" fontFamily="system-ui, sans-serif">On my way! Will move</text>
              <text x="166" y="30" fontSize="10" fill="white" fontFamily="system-ui, sans-serif">in 2 min. Sorry! ✓</text>
              <text x="151" y="42" fontSize="8.5" fill="#64748b" fontFamily="ui-monospace, monospace">now</text>
            </g>
            {/* Preset quick-reply chips */}
            <g transform="translate(12 170)">
              {['🚨 Damage report', '🅿️ Blocking exit', '💡 Lights on'].map((label, i) => (
                <g key={i} transform={`translate(${i * 108} 0)`}>
                  <rect x="0" y="0" width="100" height="22" rx="11" fill="rgba(15,76,129,0.08)" />
                  <text x="50" y="15" textAnchor="middle" fontSize="8.5" fill="#0F4C81" fontFamily="system-ui, sans-serif" fontWeight="600">{label}</text>
                </g>
              ))}
            </g>
          </g>
          <text x="300" y="430" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#64748b" letterSpacing="2">REAL-TIME · ANONYMOUS · ENCRYPTED</text>
        </g>
      )}
    </svg>
  );
}
