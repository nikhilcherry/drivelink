import { InvestorCTA } from '../../sections/InvestorCTA';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface PageInvestorsProps {
  setPage: (page: Page) => void;
}

const traction = [
  { lbl: 'AIR', val: '5', sub: 'Pitch Arena · IIT Delhi' },
  { lbl: 'Patent', val: 'Granted', sub: 'Option · April 2026' },
  { lbl: 'Protocol', val: 'v0.1', sub: 'Spec frozen' },
  { lbl: 'Stack', val: 'Live', sub: 'Autonomous v1.0 deployed' },
];

export function PageInvestors({ setPage }: PageInvestorsProps) {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 160 }}>
        <div className="dlw-container">
          <div className="dlw-section-head" style={{ maxWidth: 880 }}>
            <div className="dlw-eyebrow"><span className="num">I</span> Investors</div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 4.8rem)', letterSpacing: '-0.04em' }}>
              Cooperative mobility is <span className="dlw-text-gradient">a category, not a feature.</span>
            </h1>
            <p className="dlw-section-sub">
              We&apos;re building the protocol layer for every vehicle on the road. Here&apos;s where we are, what we&apos;ve validated, and what we&apos;re raising for.
            </p>
          </div>

          <div className="dlw-traction">
            {traction.map((s, i) => (
              <div key={i} className="dlw-traction-card">
                <div className="dlw-traction-lbl">{s.lbl}</div>
                <div className="dlw-traction-val">{s.val}</div>
                <div className="dlw-traction-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <div className="dlw-two-col">
            <div>
              <div className="dlw-eyebrow"><span className="num">$</span> The ask</div>
              <h2 className="dlw-section-title" style={{ marginTop: 14 }}>
                Seed round.<br />For the alpha pilot.
              </h2>
              <p className="dlw-section-sub" style={{ marginBottom: 22 }}>
                We are raising a seed round to deploy the alpha pilot with two OEM partners, finalize hardware integration, and freeze v1.0 of the DriveLink Protocol.
              </p>
              <ul className="dlw-ask-list">
                <li><b>Alpha pilot</b> · 2 OEM partners · hardware-in-the-loop tests</li>
                <li><b>Decentralized Data Node v1</b> · launch + secure data verification</li>
                <li><b>DRV Token Protocol audit</b> · incentive-layer security review</li>
                <li><b>Cross-OEM standardization</b> · v1.0 protocol freeze, smart-city pilots</li>
              </ul>
              <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
                <a className="dlw-btn dlw-btn-primary" href="mailto:tech.drivelink@gmail.com?subject=Investor%20deck%20request">Request investor deck</a>
                <a className="dlw-btn dlw-btn-ghost" href="mailto:tech.drivelink@gmail.com?subject=Intro%20call">Schedule intro</a>
              </div>
            </div>

            <div className="dlw-revenue">
              <div className="dlw-eyebrow" style={{ marginBottom: 20 }}><span className="num">$</span> Revenue model</div>
              <div className="dlw-revenue-row"><span>Fleet SaaS</span><span>Per-vehicle subscription</span></div>
              <div className="dlw-revenue-row"><span>OEM licensing</span><span>Per-vehicle + update fees</span></div>
              <div className="dlw-revenue-row"><span>Smart-city contracts</span><span>Per-corridor deployment</span></div>
              <div className="dlw-revenue-row"><span>Analytics</span><span>Intent heatmaps · conflict-zone APIs</span></div>
              <div className="dlw-revenue-foot dlw-mono">Hybrid · high-margin tail</div>
            </div>
          </div>
        </div>
      </section>

      <InvestorCTA onPartner={() => {}} />
    </main>
  );
}
