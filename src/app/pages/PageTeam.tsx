import { Linkedin, Twitter, Github } from 'lucide-react';
import { InvestorCTA } from '../../sections/InvestorCTA';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface PageTeamProps {
  setPage: (page: Page) => void;
}

// TODO(founder): add real social URLs (replace the '#' placeholders below)
const founders = [
  {
    initial: 'H', name: 'Hruday', role: 'CEO · Chief Systems Architect', tag: 'Co-founder',
    bio: 'Leads the vision, protocol architecture, and strategic partnerships. Builds the standardization roadmap that takes DriveLink from prototype to global standard.',
    focus: ['Systems strategy', 'Protocol design', 'OEM partnerships'],
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    initial: 'N', name: 'Nikhil', role: 'CTO · Computer Science', tag: 'Co-founder',
    bio: 'Owns the prediction engine, the simulation environment, and V2V messaging intelligence. Writes the code that makes intent travel under 50 milliseconds.',
    focus: ['Prediction engine', 'Simulation', 'Mesh protocol'],
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    initial: 'K', name: 'Krishna', role: 'CPO · Mechanical Engineering', tag: 'Co-founder',
    bio: 'Responsible for hardware feasibility, integration, and real-vehicle interfacing. Bridges the embedded module with mechanical reality.',
    focus: ['Hardware', 'Vehicle integration', 'Mechanical systems'],
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    initial: 'S', name: 'Shreyas', role: 'Chief Development Officer', tag: 'Core team',
    bio: 'Designs and trains the perception-based RandomForest policies behind every decision a DriveLink car makes — lane changes, exits, and cooperative merges — served live over WebSocket and validated in SUMO against real-world trajectory data.',
    focus: ['Decision models', 'Perception-based ML', 'SUMO validation'],
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    // TODO(founder): Harish role + bio
    initial: 'H', name: 'Harish', role: 'Core Team', tag: 'Core team',
    bio: 'Placeholder bio — confirm Harish’s focus area and contributions.',
    focus: ['TODO: focus 1', 'TODO: focus 2', 'TODO: focus 3'],
    socials: { linkedin: '#', x: '#', github: '#' },
  },
];

const advisors = [
  { name: 'Harsirjan Kour', role: 'Core Team · PedalStart', note: 'Early validation, founder mentorship' },
  { name: 'Sayanee Bhowmik', role: 'Ex-VC · Startup Mentor', note: 'Direction refinement, fundraising guidance' },
  { name: 'Debasis Chakraborty', role: 'CEO · Dariaan Consulting', note: 'First investor meeting, strategic input' },
  { name: 'CEO · Simple Energy', role: 'Industry advisor', note: 'EV fleet movement insights' },
  // TODO(founder): confirm where extra names go + who they are
  { name: 'Advisor name TBC', role: 'Role · Organization', note: 'Placeholder — replace with real advisor/validation credit' },
  { name: 'Advisor name TBC', role: 'Role · Organization', note: 'Placeholder — replace with real advisor/validation credit' },
];

export function PageTeam({ setPage }: PageTeamProps) {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 160 }}>
        <div className="dlw-container">
          <div className="dlw-section-head" style={{ maxWidth: 880 }}>
            <div className="dlw-eyebrow"><span className="num">T</span> Team</div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 4.8rem)', letterSpacing: '-0.04em' }}>
              The team building <span className="dlw-text-gradient">the backbone.</span>
            </h1>
            <p className="dlw-section-sub">Three co-founders and the technical core — systems, software, hardware, and the ML brain — owned end to end.</p>
          </div>

          <div className="dlw-team-detail-grid is-four">
            {founders.map((m, i) => (
              <div key={i} className="dlw-team-detail">
                <span className={'dlw-team-tag ' + (m.tag === 'Co-founder' ? 'founder' : 'core')}>{m.tag}</span>
                <div className="dlw-team-portrait" style={{ width: 96, height: 96, fontSize: 36 }}>{m.initial}</div>
                <div className="dlw-team-role">{m.role}</div>
                <h3 className="dlw-team-name">{m.name}</h3>
                <p className="dlw-team-bio">{m.bio}</p>
                <div className="dlw-team-focus">
                  {m.focus.map((f, j) => <span key={j} className="dlw-team-focus-pill">{f}</span>)}
                </div>
                <div className="dlw-team-socials">
                  <a className="dlw-team-social" href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>
                    <Linkedin size={16} />
                  </a>
                  <a className="dlw-team-social" href={m.socials.x} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on X`}>
                    <Twitter size={16} />
                  </a>
                  <a className="dlw-team-social" href={m.socials.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`}>
                    <Github size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dlw-section dlw-section-paper">
        <div className="dlw-container">
          <div className="dlw-section-head" style={{ maxWidth: 880 }}>
            <div className="dlw-eyebrow"><span className="num">A</span> Advisors & mentors</div>
            <h2 className="dlw-section-title">Validated by people who&apos;ve built before.</h2>
          </div>

          <div className="dlw-advisor-grid">
            {advisors.map((a, i) => (
              <div key={i} className="dlw-advisor">
                <div className="dlw-advisor-portrait">
                  {a.name.split(' ').map(s => s[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4>{a.name}</h4>
                  <p className="dlw-advisor-role">{a.role}</p>
                  <p className="dlw-advisor-note">{a.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InvestorCTA onPartner={() => setPage('investors')} />
    </main>
  );
}
