'use client';
import { useState } from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { InvestorCTA } from '../../sections/InvestorCTA';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface PageTeamProps {
  setPage: (page: Page) => void;
}

interface Socials {
  github?: string;
  linkedin?: string;
  x?: string;
}

// Social URLs are added per-member as they're confirmed; unset ones render no icon.
const founders: {
  initial: string; photo?: string; name: string; role: string; tag: string; bio: string; focus: string[]; socials: Socials;
}[] = [
  {
    initial: 'H', photo: '/team/hruday.jpg', name: 'Hruday', role: 'CEO · Chief Systems Architect', tag: 'Co-founder',
    bio: 'Leads the vision, protocol architecture, and strategic partnerships. Builds the standardization roadmap that takes DriveLink from prototype to global standard.',
    focus: ['Systems strategy', 'Protocol design', 'OEM partnerships'],
    socials: {},
  },
  {
    initial: 'N', photo: '/team/nikhil.jpg', name: 'Nikhil', role: 'CTO · Computer Science', tag: 'Co-founder',
    bio: 'Owns the prediction engine, the simulation environment, and V2V messaging intelligence. Writes the code that makes intent travel under 50 milliseconds.',
    focus: ['Prediction engine', 'Simulation', 'Mesh protocol'],
    socials: { github: 'https://github.com/nikhilcherry' },
  },
  {
    initial: 'K', name: 'Krishna', role: 'CPO · Mechanical Engineering', tag: 'Co-founder',
    bio: 'Responsible for hardware feasibility, integration, and real-vehicle interfacing. Bridges the embedded module with mechanical reality.',
    focus: ['Hardware', 'Vehicle integration', 'Mechanical systems'],
    socials: {},
  },
  {
    initial: 'S', photo: '/team/shreyas.jpg', name: 'Shreyas', role: 'Chief Development Officer', tag: 'Core team',
    bio: 'Designs and trains the perception-based RandomForest policies behind every decision a DriveLink car makes — lane changes, exits, and cooperative merges — served live over WebSocket and validated in SUMO against real-world trajectory data.',
    focus: ['Decision models', 'Perception-based ML', 'SUMO validation'],
    socials: { github: 'https://github.com/shreyasrajshekar' },
  },
];

const advisors = [
  { name: 'Harsirjan Kour', role: 'Core Team · PedalStart', note: 'Early validation, founder mentorship' },
  { name: 'Sayanee Bhowmik', role: 'Ex-VC · Startup Mentor', note: 'Direction refinement, fundraising guidance' },
  { name: 'Debasis Chakraborty', role: 'CEO · Dariaan Consulting', note: 'First investor meeting, strategic input' },
  { name: 'Suhas Rajkumar', role: 'CEO · Simple Energy', note: 'EV fleet movement insights' },
];

function Portrait({ photo, initial, name, size, fontSize }: { photo?: string; initial: string; name: string; size: number; fontSize: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="dlw-team-portrait" style={{ width: size, height: size, fontSize }}>
      {photo && !failed ? <img src={photo} alt={name} onError={() => setFailed(true)} /> : initial}
    </div>
  );
}

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
                <Portrait photo={m.photo} initial={m.initial} name={m.name} size={96} fontSize={36} />
                <div className="dlw-team-role">{m.role}</div>
                <h3 className="dlw-team-name">{m.name}</h3>
                <p className="dlw-team-bio">{m.bio}</p>
                <div className="dlw-team-focus">
                  {m.focus.map((f, j) => <span key={j} className="dlw-team-focus-pill">{f}</span>)}
                </div>
                {(m.socials.linkedin || m.socials.x || m.socials.github) && (
                  <div className="dlw-team-socials">
                    {m.socials.linkedin && (
                      <a className="dlw-team-social" href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>
                        <Linkedin size={16} />
                      </a>
                    )}
                    {m.socials.x && (
                      <a className="dlw-team-social" href={m.socials.x} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on X`}>
                        <Twitter size={16} />
                      </a>
                    )}
                    {m.socials.github && (
                      <a className="dlw-team-social" href={m.socials.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`}>
                        <Github size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="dlw-team-spotlight">
            <div className="dlw-spotlight-avatar">
              <div className="dlw-team-portrait" style={{ width: 120, height: 120, fontSize: 44 }}>H</div>
              <span className="dlw-spotlight-label">M-01 · Mentor</span>
            </div>
            <div className="dlw-spotlight-main">
              <div className="dlw-team-role">Mentor · Core Team Member · Strategic Guidance</div>
              <h3 className="dlw-team-name">Dr. Harish L</h3>
              <p className="dlw-team-bio">
                Guides DriveLink&apos;s strategy and execution as the team&apos;s core mentor. Harish pressure-tests every major decision, from protocol architecture to pitch narrative, and has shaped how DriveLink positions itself with OEMs and investors. His guidance carried the team through the IIT Delhi finals run and continues to steer the alpha pilot roadmap.
              </p>
              <div className="dlw-team-focus">
                <span className="dlw-team-focus-pill">Strategic mentorship</span>
                <span className="dlw-team-focus-pill">Pitch and positioning</span>
                <span className="dlw-team-focus-pill">Execution review</span>
              </div>
            </div>
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
