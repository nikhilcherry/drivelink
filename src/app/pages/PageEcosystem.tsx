'use client';
import { useState } from 'react';
import {
  Radio,
  Signal,
  Smartphone,
  Globe,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Zap,
  Sliders,
  Eye,
  ArrowRight,
  Siren,
  Radar,
  Wifi,
  Server,
  Filter,
} from 'lucide-react';
import { InvestorCTA } from '../../sections/InvestorCTA';
import { type Page } from '../../lib/nav';

interface PageEcosystemProps {
  setPage: (page: Page) => void;
}

type PillarId = 'all' | 'v2v' | 'v2i' | 'mobile' | 'web';

function ProtocolBadge({ name }: { name: string }) {
  return (
    <span className="dlw-proto-bracket-tag" aria-label={`${name} protocol identifier`}>
      <span className="dlw-proto-paren" aria-hidden="true">(</span>
      <span className="dlw-proto-code">{name}</span>
      <span className="dlw-proto-paren" aria-hidden="true">)</span>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────
   1. ISOLATED V2V PROTOCOL FRAME INSPECTOR WIDGET
   Zero raw code blocks — 100% visual interactive field explorer
   ─────────────────────────────────────────────────────────── */
function V2VFrameInspector() {
  const [activeFrameSection, setActiveFrameSection] = useState<'intent' | 'kinematics' | 'crypto'>('intent');

  return (
    <div className="dlw-frame-inspector">
      <div className="dlw-frame-head">
        <div className="title">
          <Radio size={14} />
          <span>drv-mesh v0.1 · 256-Byte Binary Frame Layout</span>
        </div>
        <div className="tabs">
          <button
            type="button"
            className={activeFrameSection === 'intent' ? 'is-active' : ''}
            onClick={() => setActiveFrameSection('intent')}
          >
            Intent &amp; Trajectory
          </button>
          <button
            type="button"
            className={activeFrameSection === 'kinematics' ? 'is-active' : ''}
            onClick={() => setActiveFrameSection('kinematics')}
          >
            CAN Kinematics
          </button>
          <button
            type="button"
            className={activeFrameSection === 'crypto' ? 'is-active' : ''}
            onClick={() => setActiveFrameSection('crypto')}
          >
            Security &amp; Ephemeral ID
          </button>
        </div>
      </div>

      <div className="dlw-frame-body">
        {activeFrameSection === 'intent' && (
          <div className="dlw-frame-grid">
            <div className="field-card highlight">
              <span className="name">PREDICTED INTENT</span>
              <span className="val">LANE_CHANGE_LEFT</span>
              <span className="desc">Derived from steering torque + blinker trigger (0.94 probability)</span>
            </div>
            <div className="field-card">
              <span className="name">TRAJECTORY HORIZON</span>
              <span className="val">1.5 Seconds</span>
              <span className="desc">Forward probabilistic polynomial cone (x[t], y[t])</span>
            </div>
            <div className="field-card">
              <span className="name">TIME TO MANEUVER</span>
              <span className="val">1.1 Seconds</span>
              <span className="desc">Estimated time before physical boundary crossing</span>
            </div>
            <div className="field-card">
              <span className="name">CONFLICT ARBITRATION</span>
              <span className="val">COOPERATIVE_MERGE</span>
              <span className="desc">Automated safe envelope reservation with neighbor vehicles</span>
            </div>
          </div>
        )}

        {activeFrameSection === 'kinematics' && (
          <div className="dlw-frame-grid">
            <div className="field-card">
              <span className="name">VEHICLE SPEED</span>
              <span className="val">53.4 km/h (14.85 m/s)</span>
              <span className="desc">Fused wheel-speed &amp; inertial measurement</span>
            </div>
            <div className="field-card">
              <span className="name">STEERING RATE</span>
              <span className="val">-3.8° / sec</span>
              <span className="desc">Angular steering column velocity</span>
            </div>
            <div className="field-card">
              <span className="name">LONGITUDINAL ACCEL</span>
              <span className="val">-1.2 m/s²</span>
              <span className="desc">Gentle deceleration curve</span>
            </div>
            <div className="field-card">
              <span className="name">INGEST FREQUENCY</span>
              <span className="val">100 Hz</span>
              <span className="desc">12 real-time CAN/Ethernet signals ingested every 10ms</span>
            </div>
          </div>
        )}

        {activeFrameSection === 'crypto' && (
          <div className="dlw-frame-grid">
            <div className="field-card highlight">
              <span className="name">SIGNATURE SCHEME</span>
              <span className="val">Ed25519 (64-byte)</span>
              <span className="desc">Hardware security module (HSM) signed for tamper-proof delivery</span>
            </div>
            <div className="field-card">
              <span className="name">EPHEMERAL NODE ID</span>
              <span className="val">0x9E4B...72A1</span>
              <span className="desc">Rotates every 5 minutes to prevent tracking of vehicle or owner</span>
            </div>
            <div className="field-card">
              <span className="name">VIN PRIVACY</span>
              <span className="val">ZERO-KNOWLEDGE</span>
              <span className="desc">No vehicle VIN, plates, or owner records are ever transmitted</span>
            </div>
            <div className="field-card">
              <span className="name">AUTHENTICATION TIME</span>
              <span className="val">&lt;2.1 ms</span>
              <span className="desc">Peer cryptographic verification overhead</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   2. ISOLATED V2I SMART INTERSECTION SIMULATOR
   Zero global timer lag — local state toggle with instant response
   ─────────────────────────────────────────────────────────── */
function V2ISimulatorWidget() {
  const [emergencyActive, setEmergencyActive] = useState(false);

  return (
    <div className="dlw-v2i-sim-widget">
      <div className="dlw-v2i-sim-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dlw-live-pulse" />
          <span className="dlw-mono" style={{ fontSize: 12, fontWeight: 600 }}>RSU-BLR-INTERSECTION-09</span>
        </div>
        <span className="dlw-mono" style={{ fontSize: 11, color: '#38bdf8' }}>5.9 GHz DSRC / C-V2X</span>
      </div>

      <div className="dlw-v2i-sim-body">
        <div className="dlw-v2i-signal-card">
          <div className="light-indicator">
            <span className={`bulb ${emergencyActive ? 'green' : 'amber'}`} />
          </div>
          <div>
            <div className="dlw-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              SIGNAL PHASE &amp; TIMING (SPaT)
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
              {emergencyActive ? 'EMERGENCY GREEN PREEMPTION ACTIVE' : 'GREEN IN 3.8s · PHASE 02'}
            </div>
          </div>
        </div>

        <div className="dlw-v2i-stat-grid">
          <div className="v2i-stat">
            <span className="lbl">GLIDE SPEED ADVISORY</span>
            <span className="val">{emergencyActive ? 'PART TO SIDES' : '44 km/h'}</span>
          </div>
          <div className="v2i-stat">
            <span className="lbl">SYNCHRONIZED VEHICLES</span>
            <span className="val">{emergencyActive ? '18 CLEARED' : '18 NODES'}</span>
          </div>
          <div className="v2i-stat">
            <span className="lbl">CROSS-TRAFFIC RISK</span>
            <span className="val" style={{ color: '#22c55e' }}>ZERO HAZARD</span>
          </div>
        </div>

        <div className="dlw-v2i-action-bar">
          <button
            type="button"
            className={`dlw-btn ${emergencyActive ? 'dlw-btn-primary' : 'dlw-btn-ghost'}`}
            style={{ fontSize: 13, padding: '10px 18px', width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            onClick={() => setEmergencyActive(!emergencyActive)}
          >
            <Siren size={16} />
            {emergencyActive ? 'Reset to Standard Signal Phase' : 'Simulate Emergency Vehicle Preemption'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   3. ISOLATED IN-CABIN SMARTPHONE COCKPIT WIDGET
   High-performance SVG HUD — Zero continuous timers
   ─────────────────────────────────────────────────────────── */
function PhoneCockpitWidget() {
  const [tab, setTab] = useState<'radar' | 'alerts' | 'telemetry'>('radar');

  return (
    <div className="dlw-phone-frame">
      <div className="dlw-phone-notch" />
      <div className="dlw-phone-screen">
        <div className="dlw-phone-header">
          <div className="dlw-mono" style={{ fontSize: 11, color: '#38bdf8' }}>
            <Radio size={12} style={{ display: 'inline', marginRight: 4 }} />
            DRIVELINK COCKPIT HUD
          </div>
          <span className="dlw-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>32ms · 100Hz</span>
        </div>

        <div className="dlw-phone-tabs">
          <button
            type="button"
            className={tab === 'radar' ? 'is-active' : ''}
            onClick={() => setTab('radar')}
          >
            <Radar size={13} /> Radar HUD
          </button>
          <button
            type="button"
            className={tab === 'alerts' ? 'is-active' : ''}
            onClick={() => setTab('alerts')}
          >
            <Eye size={13} /> Live Alerts
          </button>
          <button
            type="button"
            className={tab === 'telemetry' ? 'is-active' : ''}
            onClick={() => setTab('telemetry')}
          >
            <Sliders size={13} /> CAN Bus
          </button>
        </div>

        <div className="dlw-phone-body">
          {tab === 'radar' && (
            <div className="dlw-radar-view">
              <svg className="radar-svg" viewBox="0 0 240 240" aria-label="360 degree proximity radar">
                <defs>
                  <linearGradient id="dlwRadarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Rotating Sweep Beam */}
                <g className="radar-sweep-arm">
                  <path d="M 120 120 L 120 15 A 105 105 0 0 1 195 45 Z" fill="url(#dlwRadarSweep)" />
                  <line x1="120" y1="120" x2="195" y2="45" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
                </g>

                {/* Concentric distance rings */}
                <circle cx="120" cy="120" r="105" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="120" cy="120" r="70" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="120" cy="120" r="35" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
                
                {/* Distance markers */}
                <text x="120" y="16" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="monospace">150m</text>
                <text x="120" y="52" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="monospace">100m</text>
                <text x="120" y="87" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="monospace">50m</text>

                {/* Host Vehicle */}
                <circle cx="120" cy="120" r="7" fill="#38bdf8" />
                <polygon points="120,108 124,116 116,116" fill="#38bdf8" />
                <text x="120" y="138" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">YOU</text>

                {/* Target Car 1 (Right Cruising) */}
                <circle cx="175" cy="85" r="5" fill="#22c55e" />
                <line x1="175" y1="85" x2="195" y2="75" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="2 2" />
                <text x="180" y="100" fill="#22c55e" fontSize="8" fontFamily="monospace">DRV-A2 · 48 km/h</text>

                {/* Target Car 2 (Left Decelerating) */}
                <circle cx="65" cy="70" r="5" fill="#ef4444" />
                <line x1="65" y1="70" x2="65" y2="95" stroke="#ef4444" strokeWidth="2" />
                <text x="65" y="60" fill="#ef4444" fontSize="8" textAnchor="middle" fontFamily="monospace">DRV-B4 · Decel -2.4m/s²</text>

                {/* Target Car 3 (Rear Following) */}
                <circle cx="120" cy="180" r="5" fill="#60a5fa" />
                <text x="120" y="196" fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="monospace">DRV-C1 · 52 km/h</text>
              </svg>

              <div className="radar-caption">
                3 neighboring vehicles tracked in real-time · Sub-50ms peer mesh
              </div>
            </div>
          )}

          {tab === 'alerts' && (
            <div className="dlw-alerts-feed">
              <div className="dlw-alert-card high">
                <div className="head"><Zap size={14} /> RAPID DECELERATION AHEAD</div>
                <div className="body">Vehicle DRV-B4 braking hard 70m ahead. Anti-lock assist primed.</div>
                <div className="foot">Broadcast in 22ms via direct mesh</div>
              </div>

              <div className="dlw-alert-card green">
                <div className="head"><CheckCircle2 size={14} /> GREEN WAVE PASS CONFIRMED</div>
                <div className="body">Upcoming traffic light green for next 6 seconds. Maintain 44 km/h glide.</div>
                <div className="foot">Broadcast via RSU-BLR-09</div>
              </div>

              <div className="dlw-alert-card info">
                <div className="head"><ShieldCheck size={14} /> COOPERATIVE MERGE READY</div>
                <div className="body">Adjacent EV negotiating safe merge window. Lane envelope reserved.</div>
                <div className="foot">Handshake latency 34ms</div>
              </div>
            </div>
          )}

          {tab === 'telemetry' && (
            <div className="dlw-can-gauges">
              <div className="gauge-row">
                <span className="label">VEHICLE SPEED</span>
                <span className="val">54.2 <small>km/h</small></span>
              </div>
              <div className="gauge-row">
                <span className="label">STEERING ANGLE</span>
                <span className="val">+1.4 <small>deg</small></span>
              </div>
              <div className="gauge-row">
                <span className="label">HYDRAULIC BRAKE</span>
                <span className="val">0.0 <small>bar (Coast)</small></span>
              </div>
              <div className="gauge-row">
                <span className="label">CAN BUS POLLING</span>
                <span className="val">100 <small>Hz</small></span>
              </div>
              <div className="gauge-row">
                <span className="label">EPHEMERAL KEY</span>
                <span className="val" style={{ color: '#22c55e' }}>Ed25519 ACTIVE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   4. ISOLATED WEB FLEET COMMAND CONSOLE WIDGET
   ─────────────────────────────────────────────────────────── */
function FleetConsoleWidget() {
  const [filter, setFilter] = useState<'all' | 'v2v' | 'v2i'>('all');

  return (
    <div className="dlw-web-console">
      <div className="dlw-web-console-header">
        <div className="dots">
          <span className="dot r" />
          <span className="dot y" />
          <span className="dot g" />
        </div>
        <div className="title dlw-mono">
          <Globe size={13} style={{ display: 'inline', marginRight: 6 }} />
          https://console.drivelink.tech/corridor/blr-central
        </div>
        <div className="status dlw-mono">
          <span className="live-dot" /> STREAM LIVE
        </div>
      </div>

      <div className="dlw-web-console-body">
        {/* Top KPI Stats */}
        <div className="dlw-console-kpis">
          <div className="kpi">
            <span className="kpi-label">CONNECTED VEHICLES</span>
            <span className="kpi-val">2,418</span>
            <span className="kpi-sub">Across 4 metro corridors</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">AVG MESH LATENCY</span>
            <span className="kpi-val">31.4 <small>ms</small></span>
            <span className="kpi-sub">Peer-to-peer delivery</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">COOPERATIVE MERGES</span>
            <span className="kpi-val">8,920</span>
            <span className="kpi-sub">Zero collisions recorded</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">PHANTOM JAM DAMPENING</span>
            <span className="kpi-val">-38%</span>
            <span className="kpi-sub">Corridor delay reduction</span>
          </div>
        </div>

        {/* Filter Bar & Console Stream Logs */}
        <div className="dlw-console-stream">
          <div className="stream-header dlw-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>REAL-TIME CORRIDOR TELEMETRY EVENT STREAM</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Filter size={11} />
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === 'all' ? 'rgba(56,189,248,0.25)' : 'transparent',
                  color: filter === 'all' ? '#38bdf8' : 'rgba(255,255,255,0.6)',
                }}
              >
                All Events
              </button>
              <button
                type="button"
                onClick={() => setFilter('v2v')}
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === 'v2v' ? 'rgba(56,189,248,0.25)' : 'transparent',
                  color: filter === 'v2v' ? '#38bdf8' : 'rgba(255,255,255,0.6)',
                }}
              >
                V2V Mesh
              </button>
              <button
                type="button"
                onClick={() => setFilter('v2i')}
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === 'v2i' ? 'rgba(56,189,248,0.25)' : 'transparent',
                  color: filter === 'v2i' ? '#38bdf8' : 'rgba(255,255,255,0.6)',
                }}
              >
                V2I Infra
              </button>
            </div>
          </div>

          <div className="stream-rows dlw-mono">
            {(filter === 'all' || filter === 'v2v') && (
              <div className="stream-row">
                <span className="time">22:08:41.204</span>
                <span className="tag blue">[V2V INTENT]</span>
                <span className="msg">Node DRV-A19 broadcasted LANE_CHANGE_RIGHT (cone confidence 0.96)</span>
              </div>
            )}
            {(filter === 'all' || filter === 'v2v') && (
              <div className="stream-row">
                <span className="time">22:08:41.238</span>
                <span className="tag green">[HANDSHAKE]</span>
                <span className="msg">Neighbor DRV-E42 acknowledged merge envelope in 34ms. Glide window opened.</span>
              </div>
            )}
            {(filter === 'all' || filter === 'v2i') && (
              <div className="stream-row">
                <span className="time">22:08:41.490</span>
                <span className="tag purple">[V2I SPaT]</span>
                <span className="msg">RSU-04 broadcasted signal phase timing: Phase 3 GREEN in 3.8s.</span>
              </div>
            )}
            {(filter === 'all' || filter === 'v2i') && (
              <div className="stream-row">
                <span className="time">22:08:41.810</span>
                <span className="tag amber">[FLEET ADVISORY]</span>
                <span className="msg">Corridor speed recommendation shifted to 44 km/h to prevent downstream bottleneck.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   MAIN ECOSYSTEM PAGE
   ─────────────────────────────────────────────────────────── */
export function PageEcosystem({ setPage }: PageEcosystemProps) {
  const [activePillar, setActivePillar] = useState<PillarId>('all');

  const scrollToPillar = (id: PillarId) => {
    setActivePillar(id);
    if (id !== 'all') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <main className="dlw-ecosystem-page">
      {/* ── 01 HERO SECTION ── */}
      <section className="dlw-section" style={{ paddingTop: 140, paddingBottom: 60 }}>
        <div className="dlw-container">
          <div className="dlw-section-head center" style={{ maxWidth: 960 }}>
            <div className="dlw-eyebrow">
              <span className="num" style={{ background: '#0F4C81', color: '#fff' }}>02</span>
              {' '}Unified Automotive Intelligence
            </div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2.5rem, 5.2vw, 4.6rem)', letterSpacing: '-0.04em' }}>
              The complete <span className="dlw-text-gradient">DriveLink Ecosystem.</span>
            </h1>
            <p className="dlw-section-sub" style={{ maxWidth: 780, margin: '0 auto 28px' }}>
              From sub-50ms vehicle-to-vehicle intent meshes and municipal smart traffic signals
              to cross-platform mobile driver HUDs and cloud fleet telemetry consoles — explore
              every layer of the DriveLink technology stack.
            </p>

            {/* Pillar Selector Quick-Tabs */}
            <div className="dlw-eco-pills-row" role="tablist" aria-label="Ecosystem layer navigation">
              <button
                type="button"
                role="tab"
                aria-selected={activePillar === 'all'}
                className={`dlw-eco-pill ${activePillar === 'all' ? 'is-active' : ''}`}
                onClick={() => setActivePillar('all')}
              >
                <span>All Layers</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activePillar === 'v2v'}
                className={`dlw-eco-pill ${activePillar === 'v2v' ? 'is-active' : ''}`}
                onClick={() => scrollToPillar('v2v')}
              >
                <Radio size={16} />
                <span>V2V Protocol</span>
                <span className="dlw-eco-pill-badge">drv-mesh</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activePillar === 'v2i'}
                className={`dlw-eco-pill ${activePillar === 'v2i' ? 'is-active' : ''}`}
                onClick={() => scrollToPillar('v2i')}
              >
                <Signal size={16} />
                <span>V2I Infrastructure</span>
                <span className="dlw-eco-pill-badge">drv-infra</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activePillar === 'mobile'}
                className={`dlw-eco-pill ${activePillar === 'mobile' ? 'is-active' : ''}`}
                onClick={() => scrollToPillar('mobile')}
              >
                <Smartphone size={16} />
                <span>Mobile App Dev</span>
                <span className="dlw-eco-pill-badge">drv-mobile</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activePillar === 'web'}
                className={`dlw-eco-pill ${activePillar === 'web' ? 'is-active' : ''}`}
                onClick={() => scrollToPillar('web')}
              >
                <Globe size={16} />
                <span>Web &amp; Cloud Dev</span>
                <span className="dlw-eco-pill-badge">drv-cloud</span>
              </button>
            </div>
          </div>

          {/* Unified High-Level Architecture Flow Diagram */}
          <div className="dlw-eco-arch-banner">
            <div className="dlw-eco-arch-grid">
              <div className="dlw-eco-arch-card" onClick={() => scrollToPillar('v2v')}>
                <div className="dlw-eco-arch-top">
                  <div className="badge"><Radio size={14} /> Peer Mesh</div>
                  <span className="dlw-eco-arch-layer">L1</span>
                </div>
                <h4>Vehicle (V2V)</h4>
                <p>100Hz bus telemetry + 1.5s trajectory cones broadcasted in &lt;50ms over 802.11bd.</p>
                <span className="arrow">View Protocol <ArrowRight size={14} style={{ marginLeft: 4 }} /></span>
              </div>

              <div className="dlw-eco-arch-card" onClick={() => scrollToPillar('v2i')}>
                <div className="dlw-eco-arch-top">
                  <div className="badge"><Signal size={14} /> Roadside Node</div>
                  <span className="dlw-eco-arch-layer">L2</span>
                </div>
                <h4>Infrastructure (V2I)</h4>
                <p>Smart traffic signals (SPaT), green-wave synchronization &amp; emergency vehicle preemption.</p>
                <span className="arrow">View Protocol <ArrowRight size={14} style={{ marginLeft: 4 }} /></span>
              </div>

              <div className="dlw-eco-arch-card" onClick={() => scrollToPillar('mobile')}>
                <div className="dlw-eco-arch-top">
                  <div className="badge"><Smartphone size={14} /> In-Cabin HUD</div>
                  <span className="dlw-eco-arch-layer">L3</span>
                </div>
                <h4>Mobile App Suite</h4>
                <p>Low-latency driver HUD, proximity radar, and Bluetooth CAN bridge for iOS &amp; Android.</p>
                <span className="arrow">View App Dev <ArrowRight size={14} style={{ marginLeft: 4 }} /></span>
              </div>

              <div className="dlw-eco-arch-card" onClick={() => scrollToPillar('web')}>
                <div className="dlw-eco-arch-top">
                  <div className="badge"><Server size={14} /> Cloud &amp; APIs</div>
                  <span className="dlw-eco-arch-layer">L4</span>
                </div>
                <h4>Web &amp; Fleet Cloud</h4>
                <p>Corridor digital twins, millisecond event replay engine &amp; real-time dispatcher telemetry.</p>
                <span className="arrow">View Web Dev <ArrowRight size={14} style={{ marginLeft: 4 }} /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 PILLAR 1: DRIVELINK PROTOCOL (V2V) ── */}
      {(activePillar === 'all' || activePillar === 'v2v') && (
        <section id="v2v" className="dlw-section" style={{ scrollMarginTop: 100 }}>
          <div className="dlw-container">
            <div className="dlw-section-head">
              <div className="dlw-eyebrow">
                <span className="num">P1</span> Vehicle-to-Vehicle Intent Mesh
              </div>
              <h2 className="dlw-section-title">
                DriveLink Protocol <ProtocolBadge name="drv-mesh" />
              </h2>
              <p className="dlw-section-sub">
                A vendor-neutral, peer-to-peer communication standard designed for vehicles to broadcast
                physical driver intent and predicted motion vectors before maneuvers occur.
              </p>
            </div>

            {/* V2V Key Metrics Grid */}
            <div className="dlw-traction" style={{ marginBottom: 40 }}>
              <div className="dlw-traction-card">
                <div className="dlw-traction-top">
                  <span className="dlw-traction-lbl">End-to-End Latency</span>
                  <span className="dlw-traction-chip">Real-time</span>
                </div>
                <div className="dlw-traction-val">&lt;50<span className="dlw-traction-unit">ms</span></div>
                <div className="dlw-traction-sub">CAN bus read to neighbor vehicle receipt.</div>
              </div>
              <div className="dlw-traction-card">
                <div className="dlw-traction-top">
                  <span className="dlw-traction-lbl">Prediction Horizon</span>
                  <span className="dlw-traction-chip">Forward Cone</span>
                </div>
                <div className="dlw-traction-val">1.5<span className="dlw-traction-unit">s</span></div>
                <div className="dlw-traction-sub">Probabilistic forward trajectory cone.</div>
              </div>
              <div className="dlw-traction-card">
                <div className="dlw-traction-top">
                  <span className="dlw-traction-lbl">Frame Payload</span>
                  <span className="dlw-traction-chip">Zero Bloat</span>
                </div>
                <div className="dlw-traction-val">256<span className="dlw-traction-unit">B</span></div>
                <div className="dlw-traction-sub">Ultra-compact binary gossip packet.</div>
              </div>
              <div className="dlw-traction-card">
                <div className="dlw-traction-top">
                  <span className="dlw-traction-lbl">Ingest Frequency</span>
                  <span className="dlw-traction-chip">Bus Polling</span>
                </div>
                <div className="dlw-traction-val">100<span className="dlw-traction-unit">Hz</span></div>
                <div className="dlw-traction-sub">Direct vehicle CAN &amp; Ethernet telemetry.</div>
              </div>
            </div>

            {/* 4 Feature Architecture Cards for V2V */}
            <div className="dlw-market-grid" style={{ marginBottom: 36 }}>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Radio size={22} color="#0F4C81" /></div>
                <h3>Decentralized Zero-Hop Mesh</h3>
                <p>
                  Operates entirely ad-hoc over DSRC and C-V2X direct mode (PC5). Vehicles communicate
                  peer-to-peer without relying on cell towers, central cloud brokers, or internet connectivity.
                </p>
              </div>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Cpu size={22} color="#0F4C81" /></div>
                <h3>Kinematic Intent Inference</h3>
                <p>
                  Fuses 12 critical vehicle bus parameters — steering torque, throttle angle, hydraulic brake pressure,
                  and yaw rate — into actionable maneuvers (lane change, sudden decel, zipper merge).
                </p>
              </div>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><ShieldCheck size={22} color="#0F4C81" /></div>
                <h3>Zero-Knowledge Ephemeral Signing</h3>
                <p>
                  Packets are signed using rotating Ed25519 cryptographic keys. Neighbors verify authenticity
                  and message integrity with zero leakage of vehicle VIN, owner identity, or tracking history.
                </p>
              </div>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Activity size={22} color="#0F4C81" /></div>
                <h3>Cooperative Merge Negotiation</h3>
                <p>
                  Vehicles engage in automated cooperative handshakes during highway on-ramps and lane drops,
                  smoothing traffic flow and eliminating phantom brake-wave ripple effects.
                </p>
              </div>
            </div>

            {/* Interactive Visual Packet Inspector (Zero Raw Code) */}
            <V2VFrameInspector />
          </div>
        </section>
      )}

      {/* ── 03 PILLAR 2: DRIVELINK V2I PROTOCOL ── */}
      {(activePillar === 'all' || activePillar === 'v2i') && (
        <section id="v2i" className="dlw-section dlw-section-paper" style={{ scrollMarginTop: 100 }}>
          <div className="dlw-container">
            <div className="dlw-section-head">
              <div className="dlw-eyebrow">
                <span className="num">P2</span> Vehicle-to-Infrastructure Layer
              </div>
              <h2 className="dlw-section-title">
                DriveLink V2I Protocol <ProtocolBadge name="drv-infra" />
              </h2>
              <p className="dlw-section-sub">
                Synchronizing moving vehicles with municipal roadside units (RSUs), smart traffic signals,
                and highway corridors to coordinate non-stop green waves and prioritize emergency vehicles.
              </p>
            </div>

            <div className="dlw-two-col" style={{ alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div className="dlw-arch-body" style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 10px' }}>
                    Municipal Intelligence &amp; Intersection Radar
                  </h3>
                  <p style={{ color: 'var(--fg2)', lineHeight: 1.6, fontSize: '14px' }}>
                    DriveLink V2I transforms passive intersections into active safety nodes. Roadside Units
                    (RSUs) ingest vehicle trajectories within a 300-meter radius, calculating collision risks
                    and dynamically adjusting signal timing in real time.
                  </p>
                </div>

                <div className="dlw-feature-checklist">
                  <div className="dlw-feature-checkitem">
                    <div className="dlw-check-icon-box">
                      <CheckCircle2 size={16} color="#0F4C81" />
                    </div>
                    <div>
                      <b>Smart Signal Phase &amp; Timing (SPaT)</b>
                      <span>Streams live green-light countdowns so vehicles adjust cruise speed and glide through without stopping.</span>
                    </div>
                  </div>

                  <div className="dlw-feature-checkitem">
                    <div className="dlw-check-icon-box">
                      <CheckCircle2 size={16} color="#0F4C81" />
                    </div>
                    <div>
                      <b>Emergency Vehicle Preemption (EVP)</b>
                      <span>Cryptographically verified sirens broadcast priority beacons, turning signals green blocks ahead.</span>
                    </div>
                  </div>

                  <div className="dlw-feature-checkitem">
                    <div className="dlw-check-icon-box">
                      <CheckCircle2 size={16} color="#0F4C81" />
                    </div>
                    <div>
                      <b>Blind Corner &amp; Pedestrian Radar</b>
                      <span>Overhead intersection sensors beam alerts about occluded cross-traffic and crossing pedestrians directly into vehicles.</span>
                    </div>
                  </div>

                  <div className="dlw-feature-checkitem">
                    <div className="dlw-check-icon-box">
                      <CheckCircle2 size={16} color="#0F4C81" />
                    </div>
                    <div>
                      <b>Dynamic Corridor Speed Advisories</b>
                      <span>Municipal traffic operations broadcast optimal speed advisories to eliminate bottleneck congestion.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive V2I Smart Intersection Simulator Widget */}
              <div>
                <V2ISimulatorWidget />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 04 PILLAR 3: DRIVELINK APP DEV (CABIN & DRIVER) ── */}
      {(activePillar === 'all' || activePillar === 'mobile') && (
        <section id="mobile" className="dlw-section" style={{ scrollMarginTop: 100 }}>
          <div className="dlw-container">
            <div className="dlw-section-head">
              <div className="dlw-eyebrow">
                <span className="num">P3</span> In-Cabin &amp; Driver Awareness
              </div>
              <h2 className="dlw-section-title">
                DriveLink App Development <ProtocolBadge name="drv-mobile" />
              </h2>
              <p className="dlw-section-sub">
                Cross-platform mobile SDKs and in-cabin heads-up display (HUD) software for iOS, Android,
                and automotive Android Automotive OS (AAOS) infotainment displays.
              </p>
            </div>

            <div className="dlw-two-col" style={{ alignItems: 'center', marginBottom: 20 }}>
              {/* Left Column: Phone Frame HUD */}
              <div>
                <PhoneCockpitWidget />
              </div>

              {/* Right Column: App Dev Capabilities & Features */}
              <div>
                <div className="dlw-arch-body" style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 10px' }}>
                    Cross-Platform Mobile SDK
                  </h3>
                  <p style={{ color: 'var(--fg2)', lineHeight: 1.6, fontSize: '14px' }}>
                    DriveLink delivers production-grade native bindings for iOS, Android, and automotive infotainment OS
                    (Android Automotive / AAOS), enabling fleets and automakers to integrate cooperative intelligence in days.
                  </p>
                </div>

                <div className="dlw-market-grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
                  <div className="dlw-market-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <Smartphone size={20} color="#0F4C81" />
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>React Native &amp; Flutter Modules</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Plug-and-play reactive hooks (<code>useDriveLinkMesh</code>) exposing neighbor radar streams,
                      hazard alerts, and intent vectors with millisecond update intervals.
                    </p>
                  </div>

                  <div className="dlw-market-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <Wifi size={20} color="#0F4C81" />
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Bluetooth Low Energy &amp; Wi-Fi Direct Bridge</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Ultra-low latency hardware bridge connecting driver smartphones directly to the on-vehicle OBD-II
                      hardware transceiver without proprietary cables or pairing delays.
                    </p>
                  </div>

                  <div className="dlw-market-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <Zap size={20} color="#0F4C81" />
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Directional Spatial Audio &amp; Haptic Cues</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Pre-integrated triggers for driver seat motors and stereos that vibrate or chime left/right
                      when an occluded vehicle initiates a blindspot merge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 05 PILLAR 4: DRIVELINK WEB DEV (CLOUD & FLEET) ── */}
      {(activePillar === 'all' || activePillar === 'web') && (
        <section id="web" className="dlw-section dlw-section-paper" style={{ scrollMarginTop: 100 }}>
          <div className="dlw-container">
            <div className="dlw-section-head">
              <div className="dlw-eyebrow">
                <span className="num">P4</span> Cloud Telematics &amp; Web Platform
              </div>
              <h2 className="dlw-section-title">
                DriveLink Web Development <ProtocolBadge name="drv-cloud" />
              </h2>
              <p className="dlw-section-sub">
                Scalable web applications, browser-based digital twin visualizers, and enterprise APIs
                built for commercial fleet dispatchers and smart city transport authorities.
              </p>
            </div>

            {/* Web Console Mockup */}
            <div style={{ marginBottom: 40 }}>
              <FleetConsoleWidget />
            </div>

            {/* 4 Web Platform Feature Cards */}
            <div className="dlw-market-grid">
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Globe size={22} color="#0F4C81" /></div>
                <h3>Browser Digital Twin Engine</h3>
                <p>
                  High-performance WebGL and Canvas 2D engine rendering millions of vehicle coordinate
                  updates with smooth 60 FPS interpolation without server-side video streaming.
                </p>
              </div>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Server size={22} color="#0F4C81" /></div>
                <h3>Near-Miss &amp; Incident Replay</h3>
                <p>
                  Black-box telemetry recording engine capturing every millisecond of bus telemetry and
                  intent vectors before, during, and after safety events for dispute resolution.
                </p>
              </div>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Zap size={22} color="#0F4C81" /></div>
                <h3>Streaming WebSockets &amp; gRPC</h3>
                <p>
                  Low-overhead bidirectional streams delivering real-time vehicle kinematics to fleet dispatch
                  portals, municipal command centers, and automated dispatch engines.
                </p>
              </div>
              <div className="dlw-market-card">
                <div className="dlw-market-ic"><Layers size={22} color="#0F4C81" /></div>
                <h3>RESTful Fleet Management APIs</h3>
                <p>
                  Developer-first endpoints for historical corridor audits, driver safety scores,
                  hardware firmware updates, and geographic corridor fence configurations.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 06 ARCHITECTURAL COMPARISON MATRIX ── */}
      <section className="dlw-section">
        <div className="dlw-container">
          <div className="dlw-section-head center" style={{ maxWidth: 760 }}>
            <div className="dlw-eyebrow">
              <span className="num">VS</span> Architectural Contrast
            </div>
            <h2 className="dlw-section-title">
              Why the DriveLink <span className="dlw-text-gradient">Ecosystem wins.</span>
            </h2>
            <p className="dlw-section-sub">
              Comparing legacy cellular telematics, raw C-V2X direct radio, and the unified DriveLink cooperative mobility platform.
            </p>
          </div>

          <div className="dlw-matrix-table-wrap">
            <table className="dlw-matrix-table">
              <thead>
                <tr>
                  <th>Architecture Dimension</th>
                  <th>Legacy Cellular Telematics</th>
                  <th>Raw C-V2X Direct Radio</th>
                  <th className="highlight">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span>DriveLink Unified Ecosystem</span>
                      <span className="dlw-matrix-chip">RECOMMENDED</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>End-to-End Latency</strong></td>
                  <td>800ms - 2,500ms (Cell Tower)</td>
                  <td>100ms - 250ms (Unstructured)</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>&lt;50ms (Direct Zero-Hop Mesh)</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Data Transmitted</strong></td>
                  <td>Past GPS coordinate trace</td>
                  <td>Raw coordinates only</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>1.5s Probabilistic Intent Cones</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Cellular Outage Resilience</strong></td>
                  <td>Fails completely (0% uptime)</td>
                  <td>Radio layer operates only</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>100% Autonomous Peer Mesh</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Driver Privacy</strong></td>
                  <td>Central server logs VIN &amp; trip</td>
                  <td>Fixed radio MAC address</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>Rotating Ed25519 Ephemeral IDs</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Multi-OEM Interoperability</strong></td>
                  <td>Walled gardens (OEM silos)</td>
                  <td>Hardware-only standard</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>Standardized Open Frame Spec (v0.1)</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Infrastructure Integration</strong></td>
                  <td>Unsynchronized cloud</td>
                  <td>Requires costly RSU upgrades</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>SPaT &amp; Emergency Preemption Built-in</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Driver HUD Integration</strong></td>
                  <td>Heavy cloud lag</td>
                  <td>No native UI or mobile SDK</td>
                  <td className="highlight">
                    <div className="dlw-matrix-cell-val">
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      <strong>Sub-50ms React Native &amp; AAOS HUD</strong>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 07 INVESTOR CTA ── */}
      <InvestorCTA onPartner={() => setPage('investors')} />
    </main>
  );
}
