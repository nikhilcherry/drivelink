'use client';
import {
  Cpu, Radio, Brain, ShieldAlert, GitBranch, Boxes, Workflow, Gauge,
  Database, Network, ArrowRight, FlaskConical, Car, RadioTower,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '../../components/anim/Reveal';
import { CountUp } from '../../components/anim/CountUp';
import { RepoShowcase } from '../../sections/RepoShowcase';
import { InvestorCTA } from '../../sections/InvestorCTA';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface Props {
  setPage: (p: Page) => void;
}

const toc = [
  { id: 'architecture', label: 'Architecture', Icon: Boxes },
  { id: 'methodology', label: 'Methodology', Icon: FlaskConical },
  { id: 'traffic', label: 'Traffic Modeling', Icon: Workflow },
  { id: 'comms', label: 'V2V & V2I', Icon: Radio },
  { id: 'conflict', label: 'Conflict & Risk', Icon: ShieldAlert },
  { id: 'models', label: 'The Models', Icon: Brain },
  { id: 'repos', label: 'Source', Icon: GitBranch },
  { id: 'roadmap', label: 'Roadmap', Icon: Gauge },
];

const features = [
  { name: 'speed', type: 'float', range: '0–25 m/s', desc: 'Current velocity of the vehicle.' },
  { name: 'urgency', type: 'float', range: '0–1', desc: 'How critical the maneuver is (0 = relaxed, 1 = critical).' },
  { name: 'aggressiveness', type: 'float', range: '0–1', desc: 'Driver personality (0 = cautious, 1 = aggressive).' },
  { name: 'rel_target', type: 'int', range: '−2…+2', desc: 'Lanes to target relative to current (−1 left, +1 right).' },
  { name: 'perceived_gap', type: 'float', range: '0–40 m', desc: 'Distance to nearest car in the target lane. Larger ⇒ more likely to merge.' },
];

const models = [
  { name: 'Lane change', file: 'model_lane_change.pkl', out: 'MERGE / WAIT', train: 'General lane-changing in multi-lane flow' },
  { name: 'Turning (exit)', file: 'model_turning.pkl', out: 'MERGE / WAIT', train: 'Reaching an exit lane before the exit' },
  { name: 'V2V chat', file: 'model_v2v_chat.pkl', out: 'NEGOTIATE_MERGE / HOLD', train: 'Cooperative merge where a neighbour yields' },
];

const pipeline = [
  { k: 'train_models.py', v: 'Generate perception-based data, fit & persist', Icon: Database },
  { k: 'models/*.pkl', v: 'Three serialized RandomForests', Icon: Boxes },
  { k: 'model_manager.py', v: 'Load, validate input, predict + confidence', Icon: Cpu },
  { k: 'ml_server.py', v: 'WebSocket inference on ws://:8765', Icon: Network },
  { k: 'Godot client', v: 'car_state → acts on MERGE / WAIT', Icon: Car },
];

const roadmap = [
  { phase: 'Phase 1', title: 'Perception-based ML + Godot sim', status: 'Shipped', body: 'Three RandomForest policies trained on perceived gaps; live WebSocket inference driving the Godot highway & intersection scenes.' },
  { phase: 'Phase 2', title: 'SUMO realism validation', status: 'In progress', body: 'Run the same models as a vehicle policy inside SUMO (IDM + LC2013) and score resulting traffic against HighD / NGSIM trajectory data.' },
  { phase: 'Phase 3', title: 'On-vehicle edge module', status: 'Planned', body: 'Lightweight hardware + embedded inference reading bus telemetry at 100 Hz across 12 signals.' },
  { phase: 'Phase 4', title: 'V2I mesh & intent heatmaps', status: 'Planned', body: 'Roadside / intersection nodes aggregate intents into conflict-zone heatmaps and city-grade insight pipelines.' },
  { phase: 'Phase 5', title: 'OEM SDK & fleet analytics', status: 'Planned', body: 'Per-vehicle licensing on top of existing ADAS stacks, with fleet APIs and cross-OEM cooperation studies.' },
];

export function PageDocs({ setPage }: Props) {
  return (
    <main className="dlw-docs">
      {/* ---------- Hero ---------- */}
      <section className="dlw-section" style={{ paddingTop: 150, paddingBottom: 40 }}>
        <div className="dlw-container">
          <Reveal className="dlw-section-head" direction="up" as="div">
            <div className="dlw-eyebrow"><span className="num">DOC</span> Technical Documentation</div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 4.8rem)', letterSpacing: '-0.04em' }}>
              How DriveLink <span className="dlw-text-gradient">actually works.</span>
            </h1>
            <p className="dlw-section-sub">
              A deep, honest walk through the DriveLink ecosystem — the simulation engine, the machine-learning
              decision models, the V2V/V2I communication layer, and the conflict-detection math behind it all.
            </p>
          </Reveal>

          <RevealGroup className="dlw-doc-kpis">
            {[
              { v: 3, label: 'ML decision models', suffix: '' },
              { v: 5, label: 'Input features', suffix: '' },
              { v: 0.99, label: 'Held-out accuracy', suffix: '', dec: 2 },
              { v: 50, label: 'V2V delivery', suffix: 'ms', prefix: '<' },
            ].map((k) => (
              <RevealItem key={k.label} className="dlw-doc-kpi">
                <span className="v">
                  <CountUp to={k.v} decimals={k.dec ?? 0} prefix={k.prefix ?? ''} suffix={k.suffix} />
                </span>
                <span className="k">{k.label}</span>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="dlw-doc-toc">
            {toc.map(({ id, label, Icon }) => (
              <a key={id} href={`#${id}`} className="dlw-doc-tocchip">
                <Icon size={14} /> {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Architecture ---------- */}
      <section id="architecture" className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <DocHead eyebrow="01 · System" title="System architecture" Icon={Boxes}
            sub="DriveLink is two cooperating halves: a real-time decision backend, and a simulation client that consumes its decisions. The same models and inference code are shared — unchanged — between gameplay and research." />

          <Reveal className="dlw-doc-pipeline">
            {pipeline.map((p, i) => (
              <div key={p.k} className="dlw-doc-pnode-wrap">
                <div className="dlw-doc-pnode">
                  <div className="ic"><p.Icon size={18} color="#0F4C81" /></div>
                  <code>{p.k}</code>
                  <span>{p.v}</span>
                </div>
                {i < pipeline.length - 1 && <ArrowRight className="dlw-doc-parrow" size={18} />}
              </div>
            ))}
          </Reveal>

          <RevealGroup className="dlw-doc-cards3">
            {[
              { Icon: Cpu, t: 'On-Vehicle Module', b: 'Reads bus telemetry, performs local trajectory prediction, and emits compact intents — designed to sit on top of an existing ADAS stack.' },
              { Icon: RadioTower, t: 'DriveLink Protocol', b: 'An intent-first V2V message standard: small payloads, gossip-friendly mesh, sub-50 ms delivery between neighbouring vehicles.' },
              { Icon: Brain, t: 'Intelligence Layer', b: 'Fleet & city analytics: conflict-zone detection, intent heatmaps, and OEM-grade insight pipelines built on aggregated intents.' },
            ].map((c) => (
              <RevealItem key={c.t} className="dlw-doc-card">
                <div className="dlw-doc-cardic"><c.Icon size={22} color="#0F4C81" /></div>
                <h3>{c.t}</h3>
                <p>{c.b}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- Methodology ---------- */}
      <section id="methodology" className="dlw-section">
        <div className="dlw-container">
          <DocHead eyebrow="02 · Methodology" title="Simulation methodology" Icon={FlaskConical}
            sub="Instead of learning from hidden ground truth, every model is trained on what a car actually perceives — a coherent perception-based agent." />

          <div className="dlw-doc-split">
            <Reveal direction="right" className="dlw-doc-prose">
              <p>
                Each model is fit on a small micro-simulation where vehicles decide with a single, legible rule:
                <em> move toward the target lane when the move is needed, the perceived gap is large enough for this
                  driver&apos;s aggressiveness, and there is enough urgency.</em>
              </p>
              <p>
                The label is derived from <code>perceived_gap</code> — a continuous distance in metres that matches
                exactly what the Godot client sends at runtime — with a small Gaussian perception jitter so the
                returned <code>confidence</code> stays smooth and well-calibrated. This removes the artificial noise
                ceiling of random-data approaches and yields a clean decision boundary at roughly
                {' '}<b>0.99 held-out accuracy</b>.
              </p>
              <div className="dlw-doc-callout">
                <FlaskConical size={16} />
                <span>Models, <code>model_manager.py</code>, and the WebSocket server are shared unchanged between the
                  gameplay path and the SUMO research harness — inference is never reimplemented.</span>
              </div>
            </Reveal>

            <Reveal direction="left" className="dlw-doc-tablewrap">
              <div className="dlw-doc-tabletitle"><Database size={14} /> Feature vector · 5 dimensions</div>
              <table className="dlw-doc-table">
                <thead><tr><th>Feature</th><th>Type</th><th>Range</th><th>Meaning</th></tr></thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.name}>
                      <td><code>{f.name}</code></td>
                      <td>{f.type}</td>
                      <td>{f.range}</td>
                      <td>{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Traffic Modeling ---------- */}
      <section id="traffic" className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <DocHead eyebrow="03 · Traffic" title="Traffic modeling & realism" Icon={Workflow}
            sub="The defensible-realism path: run the same DriveLink policy inside SUMO with validated dynamics, then measure the resulting traffic against real-world trajectory data." />

          <div className="dlw-doc-split">
            <Reveal direction="right" className="dlw-doc-shot">
              <img src="/sim/highway.png" alt="DriveLink highway simulation" loading="lazy" />
              <span className="cap">Highway scene — live lane-change & V2V negotiation in the Godot client.</span>
            </Reveal>
            <Reveal direction="left" className="dlw-doc-prose">
              <p>
                Longitudinal motion uses the <b>Intelligent Driver Model (IDM)</b> — a continuous car-following model
                that brakes for the leader and accelerates toward a desired speed using a safe time-headway. Lateral
                decisions follow <b>LC2013</b>-style lane-change logic: change only when there is an incentive
                <em> and</em> a safe gap.
              </p>
              <p>
                In the research harness, SUMO supplies the validated dynamics while DriveLink supplies the
                <em> policy</em> (when to act). Resulting trajectories are scored against public datasets such as
                {' '}<b>HighD</b> and <b>NGSIM</b> to quantify how human-like the emergent traffic is.
              </p>
              <RevealGroup className="dlw-doc-chiprow">
                {['IDM car-following', 'LC2013 lane changes', 'SUMO microsimulation', 'HighD / NGSIM metrics'].map((c) => (
                  <RevealItem key={c}><span className="dlw-doc-chip">{c}</span></RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
          </div>

          <Reveal className="dlw-doc-note" direction="up">
            Want to feel it rather than read it? The{' '}
            <button className="dlw-doc-link" onClick={() => setPage('product')}>live in-browser playground</button>
            {' '}runs the same car-following, negotiated lane changes, merge gate and conflict heatmap, client-side.
          </Reveal>
        </div>
      </section>

      {/* ---------- V2V & V2I ---------- */}
      <section id="comms" className="dlw-section">
        <div className="dlw-container">
          <DocHead eyebrow="04 · Communication" title="V2V & V2I concepts" Icon={Radio}
            sub="Vehicles broadcast compact intents to their neighbours (V2V) and to roadside infrastructure (V2I). Cooperation is negotiated, not commanded." />

          <div className="dlw-doc-split">
            <Reveal direction="right" className="dlw-doc-prose">
              <h4><Network size={16} /> Vehicle-to-Vehicle (V2V)</h4>
              <p>
                Each car emits an <b>intent packet</b> — its pose, motion, a short probabilistic prediction cone, and a
                proposed action — to vehicles within mesh range. When one car wants a gap, the relevant neighbour can
                <em> yield</em> a slightly smaller gap, turning a standoff into a smooth cooperative merge.
              </p>
              <h4><RadioTower size={16} /> Vehicle-to-Infrastructure (V2I)</h4>
              <p>
                Roadside / intersection mesh nodes ingest the same intents to coordinate right-of-way, surface
                conflict-zone heatmaps, and feed city-scale analytics back to fleets and OEMs.
              </p>
            </Reveal>

            <Reveal direction="left" className="dlw-doc-codewrap">
              <div className="dlw-doc-codehead"><span>ws://:8765 · DriveLink wire protocol</span><span className="dim">JSON</span></div>
              <pre className="dlw-doc-code"><code>{`// request — car asks the mesh/brain for a decision
{
  "type": "predict_v2v",
  "car_state": {
    "speed": 18.4,          // m/s
    "urgency": 0.7,
    "aggressiveness": 0.4,
    "rel_target": -1,       // wants the left lane
    "perceived_gap": 6.2    // metres
  }
}

// response — calibrated decision + confidence
{
  "type": "prediction",
  "scenario": "v2v",
  "result": {
    "action": "NEGOTIATE_MERGE",
    "confidence": 0.93
  }
}`}</code></pre>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Conflict & Risk ---------- */}
      <section id="conflict" className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <DocHead eyebrow="05 · Safety" title="Conflict detection & risk analysis" Icon={ShieldAlert}
            sub="A continuous risk field over the road surface highlights where vehicles are most likely to interact dangerously — the basis of the live conflict heatmap." />

          <div className="dlw-doc-split">
            <Reveal direction="right" className="dlw-doc-prose">
              <p>
                For every pair of nearby vehicles DriveLink computes a <b>risk score</b> from three signals:
              </p>
              <ul className="dlw-doc-list">
                <li><b>Proximity</b> — closer longitudinal gaps raise risk as the gap shrinks toward the vehicle length.</li>
                <li><b>Closing speed</b> — a faster follower (rear-end risk) or converging trajectories increase severity.</li>
                <li><b>Maneuver state</b> — an active lane change or an unresolved on-ramp merge amplifies side / merge risk.</li>
              </ul>
              <p>
                High-risk pairs become <b>conflict zones</b>: pulsing hotspots rendered as a heatmap, mirroring the
                conflict-zone detection that the Intelligence Layer surfaces at city scale.
              </p>
              <RevealGroup className="dlw-doc-chiprow">
                {['Rear-end risk', 'Side / merge risk', 'TTC-weighted', 'Heatmap overlay'].map((c) => (
                  <RevealItem key={c}><span className="dlw-doc-chip danger">{c}</span></RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
            <Reveal direction="left" className="dlw-doc-shot">
              <img src="/sim/turning.png" alt="Intersection conflict zones" loading="lazy" />
              <span className="cap">Multi-junction grid — per-junction right-of-way & reservation prevent overlaps.</span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- The Models ---------- */}
      <section id="models" className="dlw-section">
        <div className="dlw-container">
          <DocHead eyebrow="06 · Models" title="The decision models" Icon={Brain}
            sub="All three are RandomForest classifiers taking the same 5 features and outputting a binary act / don't-act decision plus a calibrated confidence." />

          <Reveal className="dlw-doc-tablewrap" direction="up">
            <table className="dlw-doc-table">
              <thead><tr><th>Model</th><th>Artifact</th><th>Decision</th><th>Trained on</th></tr></thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.name}>
                    <td><b>{m.name}</b></td>
                    <td><code>{m.file}</code></td>
                    <td>{m.out}</td>
                    <td>{m.train}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <RevealGroup className="dlw-doc-cards3">
            {[
              { Icon: Database, t: 'RandomForest', b: 'Lightweight, fast, and interpretable — ideal for edge inference and easy to reason about for safety review.' },
              { Icon: Gauge, t: 'Calibrated confidence', b: 'Perception jitter during training keeps probabilities smooth, so the confidence sent to the client is meaningful.' },
              { Icon: Cpu, t: 'Robust I/O', b: 'Missing features get safe defaults and numeric coercion, so partial payloads from the client never crash the server.' },
            ].map((c) => (
              <RevealItem key={c.t} className="dlw-doc-card">
                <div className="dlw-doc-cardic"><c.Icon size={22} color="#0F4C81" /></div>
                <h3>{c.t}</h3>
                <p>{c.b}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- Repos ---------- */}
      <section id="repos" className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <DocHead eyebrow="07 · Source" title="Open repositories" Icon={GitBranch}
            sub="The simulation client and the decision brain are public. Stats are pulled live from GitHub." />
          <RepoShowcase />
        </div>
      </section>

      {/* ---------- Roadmap ---------- */}
      <section id="roadmap" className="dlw-section">
        <div className="dlw-container">
          <DocHead eyebrow="08 · Roadmap" title="Where this is going" Icon={Gauge}
            sub="From a validated simulation today to an on-vehicle, city-scale cooperative mesh." />

          <RevealGroup className="dlw-doc-timeline">
            {roadmap.map((r) => (
              <RevealItem key={r.phase} className="dlw-doc-tlitem">
                <div className="dlw-doc-tldot" data-status={r.status} />
                <div className="dlw-doc-tlbody">
                  <div className="dlw-doc-tlhead">
                    <span className="ph">{r.phase}</span>
                    <span className={`dlw-doc-tlstatus s-${r.status.replace(/\s/g, '').toLowerCase()}`}>{r.status}</span>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <InvestorCTA onPartner={() => setPage('investors')} />
    </main>
  );
}

function DocHead({ eyebrow, title, sub, Icon }: { eyebrow: string; title: string; sub: string; Icon: typeof Boxes }) {
  return (
    <Reveal className="dlw-section-head" direction="up" as="div" >
      <div className="dlw-eyebrow"><span className="num"><Icon size={12} /></span> {eyebrow}</div>
      <h2 className="dlw-section-title">{title}</h2>
      <p className="dlw-section-sub">{sub}</p>
    </Reveal>
  );
}
