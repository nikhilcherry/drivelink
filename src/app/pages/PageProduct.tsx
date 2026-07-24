import Link from 'next/link';
import { Car, Building2, RadioTower, Brain } from 'lucide-react';
import { InvestorCTA } from '../../sections/InvestorCTA';
import { SimPlayground } from '../../sections/SimPlayground';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface PageProductProps {
  setPage: (page: Page) => void;
}

const archRows = [
  { num: '01', name: 'On-Vehicle Module', body: 'Lightweight hardware module + embedded software that reads bus telemetry and performs local trajectory prediction.', tags: ['100 Hz', '12 signals', 'Edge inference'] },
  { num: '02', name: 'DriveLink Protocol', body: 'Intent-first V2V message standard. Compact payloads, gossip-friendly mesh, sub-50ms delivery between neighbors.', tags: ['<256 B', '<50 ms', 'drv-mesh'] },
  { num: '03', name: 'Intelligence Layer', body: 'Fleet & city analytics, conflict-zone detection, intent heatmaps, OEM-grade insight pipelines.', tags: ['Heatmaps', 'Conflict zones', 'Fleet APIs'] },
];

const markets = [
  { Icon: Car, name: 'EV Fleets', body: 'Reduce brake-wave traffic, smooth dispatch, real-time conflict detection across the fleet.' },
  { Icon: Building2, name: 'OEM Vehicle Manufacturers', body: 'Add cooperative behavior on top of existing ADAS stacks. License per vehicle.' },
  { Icon: RadioTower, name: 'Smart Cities', body: 'Mesh nodes at intersections feed back intent heatmaps and conflict-zone insights.' },
  { Icon: Brain, name: 'Autonomous R&D Labs', body: 'Standardized intent layer for testbeds, simulation, and cross-OEM cooperation studies.' },
];

const faqs = [
  {
    q: 'How is DriveLink different from DSRC and C-V2X?',
    a: 'Those standards define the radio and transport. DriveLink is the intent layer above them: a compact, vendor-neutral message format for predicted trajectories and maneuvers, designed to run over any underlying V2X radio, WiFi mesh, or cellular link.',
  },
  {
    q: 'Does this require new hardware in every car?',
    a: 'The protocol is transport-agnostic. The reference module is a lightweight retrofit unit, but OEMs can implement drv-mesh on existing telematics hardware.',
  },
  {
    q: 'What happens when only some cars have DriveLink?',
    a: 'The protocol is designed for partial adoption. Equipped vehicles gain cooperative behavior with each other immediately; benefits scale with penetration rather than requiring it.',
  },
  {
    q: 'Is the protocol open?',
    a: 'The v0.1 spec and reference simulation are public on GitHub. Standardization with OEM partners is on the roadmap for v1.0.',
  },
];

export function PageProduct({ setPage }: PageProductProps) {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 160 }}>
        <div className="dlw-container">
          <div className="dlw-section-head" style={{ maxWidth: 880 }}>
            <div className="dlw-eyebrow"><span className="num">P</span> Product</div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 4.8rem)', letterSpacing: '-0.04em' }}>
              The protocol for <span className="dlw-text-gradient">cars that talk first.</span>
            </h1>
            <p className="dlw-section-sub">
              DriveLink is a three-layer system: an on-vehicle module, a low-latency message standard, and an intelligence layer for fleets and cities.
            </p>
          </div>

          <div className="dlw-arch">
            {archRows.map((row, i) => (
              <div key={i} className="dlw-arch-row">
                <div className="dlw-arch-num">{row.num}</div>
                <div className="dlw-arch-body">
                  <h3>{row.name}</h3>
                  <p>{row.body}</p>
                  <div className="dlw-arch-tags">
                    {row.tags.map((t, j) => <span key={j} className="dlw-arch-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <div className="dlw-section-head" style={{ maxWidth: 880 }}>
            <div className="dlw-eyebrow"><span className="num">SIM</span> Live simulation</div>
            <h2 className="dlw-section-title">See the protocol drive traffic.</h2>
            <p className="dlw-section-sub">
              A real V2V traffic model running in your browser — car-following, negotiated lane changes,
              and an on-ramp merge gate. Toggle the mesh and watch cooperation appear.
            </p>
          </div>
          <SimPlayground />
        </div>
      </section>

      <section className="dlw-section">
        <div className="dlw-container">
          <div className="dlw-section-head center">
            <div className="dlw-eyebrow"><span className="num">USE</span> Built for</div>
            <h2 className="dlw-section-title">Four early markets.</h2>
          </div>
          <div className="dlw-market-grid">
            {markets.map((m, i) => (
              <div key={i} className="dlw-market-card">
                <div className="dlw-market-ic"><m.Icon size={22} color="#0F4C81" /></div>
                <h3>{m.name}</h3>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <div className="dlw-section-head center">
            <div className="dlw-eyebrow"><span className="num">FAQ</span> Questions</div>
            <h2 className="dlw-section-title">DriveLink vs. existing V2X.</h2>
          </div>
          <div className="dlw-faq-grid">
            {faqs.map((f, i) => (
              <div key={i} className="dlw-faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--fg3)' }}>
            New to V2V? Read the full <Link href="/v2v-communication">what is V2V communication</Link> explainer.
          </p>
        </div>
      </section>

      <InvestorCTA onPartner={() => setPage('investors')} />
    </main>
  );
}
