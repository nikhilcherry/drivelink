'use client';
import { ArrowRight, QrCode } from 'lucide-react';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface HeroConnectProps {
  onCTA: (target: Page) => void;
}

const BADGES = [
  'No App Required to Scan',
  '100% Number Privacy',
  'Instant Owner Alerts',
] as const;

const MARQUEE_PHRASES = [
  'No App Required to Scan',
  '100% Number Privacy',
  'Instant Owner Alerts',
  'Anonymous Two-Way Chat',
  'Works with Any Camera',
  'AIR 5 · IIT Delhi',
  'Patent Grant Option',
] as const;

export function HeroConnect({ onCTA }: HeroConnectProps) {
  return (
    <section className="dlw-hero" aria-labelledby="hero-heading">
      <div className="dlw-hero-bg-grid" />
      <div className="dlw-container dlw-hero-wrap">

        {/* ── Top copy ── */}
        <div className="dlw-hero-top">
          {/* Product badge / chip */}
          <div className="dlw-hero-chip">
            <span className="pulse-ring" aria-hidden="true">
              <span className="core" />
            </span>
            DriveLink Connect · Now live
          </div>

          {/* Only <h1> on the page */}
          <h1 id="hero-heading" className="dlw-hero-headline" style={{ maxWidth: 900 }}>
            The Windshield QR Tag for{' '}
            <span className="dlw-text-gradient">Private Vehicle Contact</span>
          </h1>

          <p className="dlw-hero-sub">
            Turn &ldquo;whose car is this?&rdquo; into an anonymous, instant two-way chat &mdash;
            without sharing phone numbers on either side.
          </p>

          {/* Trust badges */}
          <div className="dlw-hc-badges" role="list" aria-label="Key features">
            {BADGES.map((b) => (
              <span key={b} className="dlw-hc-badge" role="listitem">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="7" cy="7" r="7" fill="rgba(15,76,129,0.12)" />
                  <path
                    d="M4.5 7l1.8 1.8L9.5 5.5"
                    stroke="#0F4C81"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {b}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className="dlw-hero-ctas">
            <button
              id="cta-get-qr-tag"
              className="dlw-btn dlw-btn-primary"
              onClick={() => onCTA('product')}
              aria-label="Get your DriveLink Connect QR tag — go to product page"
            >
              <QrCode size={16} aria-hidden="true" />
              Get Your QR Tag
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button
              id="cta-see-demo"
              className="dlw-btn dlw-btn-ghost"
              onClick={() => {
                document
                  .getElementById('how-connect-works')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              aria-label="See how DriveLink Connect works — scroll to demo section"
            >
              See Demo Flow
            </button>
          </div>
        </div>

        {/* ── Illustration ── */}
        <ConnectIllustration />
        <p className="dlw-hero-caption">
          Conceptual product illustration. Anonymous chat session — no real phone numbers involved.
        </p>

        {/* ── Marquee ── */}
        <HeroMarquee />
      </div>
    </section>
  );
}

/* ─────────────────────────────── Marquee ─────────────────────────────── */

function HeroMarquee() {
  return (
    <div className="dlw-hero-marquee" aria-hidden="true">
      <div className="dlw-hero-marquee-track">
        {MARQUEE_PHRASES.map((phrase, i) => (
          <span className="dlw-hero-marquee-item" key={`a-${i}`}>
            <span className="dot" />
            {phrase}
          </span>
        ))}
        {/* Duplicate for seamless loop — decorative, hidden from AT */}
        {MARQUEE_PHRASES.map((phrase, i) => (
          <span className="dlw-hero-marquee-item" key={`b-${i}`} aria-hidden="true">
            <span className="dot" />
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────── SVG Illustration ─────────────────────── */

function ConnectIllustration() {
  return (
    <div
      className="dlw-hero-stage dlw-hc-stage"
      aria-label="DriveLink Connect product illustration showing a windshield QR tag and private chat"
      role="img"
    >
      <svg
        viewBox="0 0 1000 440"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Subtle dot grid */}
          <pattern id="hcGrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(15,76,129,0.055)" />
          </pattern>
          <radialGradient id="hcGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(15,76,129,0.18)" />
            <stop offset="100%" stopColor="rgba(15,76,129,0)" />
          </radialGradient>
          <filter id="hcShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="rgba(15,76,129,0.18)" />
          </filter>
        </defs>

        {/* Background */}
        <rect width="1000" height="440" fill="url(#hcGrid)" />
        <ellipse cx="500" cy="220" rx="360" ry="180" fill="url(#hcGlow)" />

        {/* ──── Left: Windshield QR tag card ──── */}
        <g transform="translate(155 90)" filter="url(#hcShadow)">
          {/* Card body */}
          <rect x="0" y="0" width="220" height="260" rx="20" fill="white" />
          <rect x="0" y="0" width="220" height="260" rx="20" fill="none" stroke="rgba(15,76,129,0.12)" strokeWidth="1.5" />

          {/* DriveLink logo stripe */}
          <rect x="0" y="0" width="220" height="44" rx="20" fill="#0F4C81" />
          <rect x="0" y="24" width="220" height="20" fill="#0F4C81" />
          <text x="110" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif" letterSpacing="0.06em">DRIVELINK CONNECT</text>

          {/* QR code placeholder grid */}
          <g transform="translate(30 62)">
            {/* Outer finder patterns */}
            <rect x="0" y="0" width="50" height="50" rx="5" fill="none" stroke="#0F4C81" strokeWidth="3" />
            <rect x="7" y="7" width="36" height="36" rx="3" fill="none" stroke="#0F4C81" strokeWidth="2" />
            <rect x="14" y="14" width="22" height="22" rx="2" fill="#0F4C81" />

            <rect x="110" y="0" width="50" height="50" rx="5" fill="none" stroke="#0F4C81" strokeWidth="3" />
            <rect x="117" y="7" width="36" height="36" rx="3" fill="none" stroke="#0F4C81" strokeWidth="2" />
            <rect x="124" y="14" width="22" height="22" rx="2" fill="#0F4C81" />

            <rect x="0" y="110" width="50" height="50" rx="5" fill="none" stroke="#0F4C81" strokeWidth="3" />
            <rect x="7" y="117" width="36" height="36" rx="3" fill="none" stroke="#0F4C81" strokeWidth="2" />
            <rect x="14" y="124" width="22" height="22" rx="2" fill="#0F4C81" />

            {/* Data modules (decorative) */}
            {[
              [66,0],[77,0],[88,0],[99,0],
              [66,11],[88,11],
              [66,22],[77,22],[99,22],
              [66,33],[99,33],
              [66,44],[77,44],[88,44],
              [110,55],[121,55],[132,55],[154,55],
              [110,77],[143,77],[154,77],
              [110,88],[121,88],[132,88],[154,88],
              [110,99],[154,99],
              [0,66],[11,66],[33,66],[44,66],
              [0,77],[33,77],
              [0,88],[11,88],[22,88],[44,88],
              [55,55],[55,77],[55,99],[55,110],[55,132],[55,154],
              [66,66],[77,66],[88,66],
              [66,99],[88,99],[99,99],
              [77,110],[88,110],[99,110],
              [110,110],[132,110],[143,110],
              [110,121],[121,121],[154,121],
              [110,132],[132,132],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="8" height="8" rx="1.5" fill="#0F4C81" opacity="0.75" />
            ))}
          </g>

          {/* Scan prompt */}
          <text x="110" y="230" textAnchor="middle" fontSize="11" fill="#0F4C81" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="0.04em">SCAN TO CONTACT OWNER</text>
          <text x="110" y="248" textAnchor="middle" fontSize="9.5" fill="rgba(15,76,129,0.55)" fontFamily="ui-monospace, monospace" letterSpacing="0.02em">drivelink.tech · 100% private</text>
        </g>

        {/* ──── Center: Animated scan beam ──── */}
        <g>
          {/* Phone outline */}
          <g transform="translate(430 110)" filter="url(#hcShadow)">
            <rect x="0" y="0" width="140" height="220" rx="22" fill="white" />
            <rect x="0" y="0" width="140" height="220" rx="22" fill="none" stroke="rgba(15,76,129,0.15)" strokeWidth="1.5" />
            {/* Screen */}
            <rect x="8" y="8" width="124" height="180" rx="16" fill="#f0f6ff" />
            {/* Camera notch */}
            <rect x="52" y="2" width="36" height="8" rx="4" fill="rgba(15,76,129,0.18)" />
            {/* Viewfinder corners */}
            <path d="M 32 38 L 24 38 L 24 46" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 108 38 L 116 38 L 116 46" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 32 150 L 24 150 L 24 142" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 108 150 L 116 150 L 116 142" stroke="#0F4C81" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Scan beam */}
            <rect x="16" y="56" width="108" height="2" rx="1" fill="rgba(15,76,129,0.55)">
              <animate attributeName="y" from="40" to="148" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.8;0.8;0" keyTimes="0;0.1;0.9;1" dur="2s" repeatCount="indefinite" />
            </rect>
            {/* Scan glow */}
            <rect x="16" y="50" width="108" height="14" rx="2" fill="rgba(15,76,129,0.06)">
              <animate attributeName="y" from="34" to="142" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2s" repeatCount="indefinite" />
            </rect>
            {/* Home bar */}
            <rect x="50" y="198" width="40" height="4" rx="2" fill="rgba(15,76,129,0.18)" />
          </g>

          {/* Scan arrow */}
          <path d="M 393 220 L 430 220" stroke="#0F4C81" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowBlue)" opacity="0.45" />
          <defs>
            <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0F4C81" />
            </marker>
          </defs>
          <text x="406" y="213" fontSize="9" fill="rgba(15,76,129,0.55)" fontFamily="ui-monospace, monospace" textAnchor="middle">SCAN</text>
        </g>

        {/* ──── Right: Chat bubbles ──── */}
        <g transform="translate(610 80)" filter="url(#hcShadow)">
          {/* Chat panel */}
          <rect x="0" y="0" width="230" height="280" rx="20" fill="white" />
          <rect x="0" y="0" width="230" height="280" rx="20" fill="none" stroke="rgba(15,76,129,0.12)" strokeWidth="1.5" />

          {/* Header */}
          <rect x="0" y="0" width="230" height="48" rx="20" fill="#0F4C81" />
          <rect x="0" y="28" width="230" height="20" fill="#0F4C81" />
          <circle cx="20" cy="24" r="10" fill="rgba(255,255,255,0.15)" />
          <text x="20" y="29" textAnchor="middle" fontSize="12" fill="white">🔒</text>
          <text x="80" y="21" fontSize="12" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">Anonymous Chat</text>
          <text x="80" y="35" fontSize="9.5" fill="rgba(255,255,255,0.65)" fontFamily="system-ui, sans-serif">No numbers shared · End-to-end</text>
          {/* Online dot */}
          <circle cx="210" cy="24" r="5" fill="#22c55e">
            <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Bubble: stranger */}
          <g transform="translate(14 62)">
            <rect x="0" y="0" width="140" height="38" rx="12" fill="#f0f6ff" />
            <text x="10" y="14" fontSize="9.5" fill="#374151" fontFamily="system-ui, sans-serif">Hi! Your car is blocking</text>
            <text x="10" y="27" fontSize="9.5" fill="#374151" fontFamily="system-ui, sans-serif">my driveway 🙏</text>
            <text x="145" y="36" fontSize="8.5" fill="rgba(15,76,129,0.4)" fontFamily="ui-monospace, monospace">09:14</text>
          </g>

          {/* Bubble: owner */}
          <g transform="translate(14 114)">
            <rect x="62" y="0" width="154" height="38" rx="12" fill="#0F4C81" />
            <text x="72" y="14" fontSize="9.5" fill="white" fontFamily="system-ui, sans-serif">Sorry! Moving it in</text>
            <text x="72" y="27" fontSize="9.5" fill="white" fontFamily="system-ui, sans-serif">2 minutes ✓</text>
            <text x="58" y="36" fontSize="8.5" fill="rgba(15,76,129,0.4)" fontFamily="ui-monospace, monospace">09:14</text>
          </g>

          {/* Preset alert chips */}
          <text x="115" y="176" textAnchor="middle" fontSize="9" fill="rgba(15,76,129,0.45)" fontFamily="system-ui, sans-serif">Or send a quick alert:</text>
          <g transform="translate(14 182)">
            <rect x="0" y="0" width="94" height="24" rx="12" fill="rgba(15,76,129,0.08)" />
            <text x="47" y="16" textAnchor="middle" fontSize="9" fill="#0F4C81" fontFamily="system-ui, sans-serif" fontWeight="600">🚨 Minor damage</text>
          </g>
          <g transform="translate(118 182)">
            <rect x="0" y="0" width="98" height="24" rx="12" fill="rgba(15,76,129,0.08)" />
            <text x="49" y="16" textAnchor="middle" fontSize="9" fill="#0F4C81" fontFamily="system-ui, sans-serif" fontWeight="600">🅿️ Blocking exit</text>
          </g>
          <g transform="translate(14 214)">
            <rect x="0" y="0" width="106" height="24" rx="12" fill="rgba(15,76,129,0.08)" />
            <text x="53" y="16" textAnchor="middle" fontSize="9" fill="#0F4C81" fontFamily="system-ui, sans-serif" fontWeight="600">💡 Lights left on</text>
          </g>

          {/* Privacy note */}
          <text x="115" y="260" textAnchor="middle" fontSize="8.5" fill="rgba(15,76,129,0.4)" fontFamily="ui-monospace, monospace" letterSpacing="0.03em">PHONE NUMBERS NEVER EXPOSED</text>
        </g>

        {/* ──── Arrow: phone → chat ──── */}
        <path d="M 580 220 L 610 220" stroke="#0F4C81" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowBlue)" opacity="0.45" />

        {/* ──── Labels ──── */}
        <text x="265" y="398" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="rgba(15,76,129,0.5)" letterSpacing="0.06em">WINDSHIELD TAG</text>
        <text x="500" y="398" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="rgba(15,76,129,0.5)" letterSpacing="0.06em">ANY CAMERA</text>
        <text x="725" y="398" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="rgba(15,76,129,0.5)" letterSpacing="0.06em">PRIVATE CHAT</text>
      </svg>

      {/* Corner labels reusing existing CSS */}
      <div className="corner-label tl">
        <span className="dot" /> <span className="num">DRIVELINK CONNECT</span> · product preview
      </div>
      <div className="corner-label tr">
        <span className="num">0 phone numbers</span> · shared at any point
      </div>
      <div className="corner-label bl">Works with any standard camera app</div>
      <div className="corner-label br">End-to-end encrypted · anonymous</div>
    </div>
  );
}
