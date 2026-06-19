import { Linkedin, Twitter, Github } from 'lucide-react';

interface Member {
  initial: string;
  name: string;
  role: string;
  tag: string;
  bio: string;
  socials: { linkedin: string; x: string; github: string };
}

// TODO(founder): add real social URLs (replace the '#' placeholders below)
const founders: Member[] = [
  {
    initial: 'H', name: 'Hruday', role: 'CEO · Chief Systems Architect', tag: 'Co-founder',
    bio: 'Leads vision, protocol architecture, partnerships, and the long-term standardization roadmap.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    initial: 'N', name: 'Nikhil', role: 'CTO · Computer Science', tag: 'Co-founder',
    bio: 'Builds the prediction engine, simulation environment, and V2V messaging intelligence.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    initial: 'K', name: 'Krishna', role: 'CPO · Mechanical Engineering', tag: 'Co-founder',
    bio: 'Handles hardware feasibility, integration, mechanical systems, and real-vehicle interfacing.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
];

const core: Member[] = [
  {
    initial: 'S', name: 'Shreyas', role: 'Chief Development Officer', tag: 'Core team',
    bio: 'Architects the RandomForest decision models — lane change, turning, and V2V negotiation — and the real-time inference that drives every car.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
];

const mentors: Member[] = [
  {
    // TODO(founder): Harish mentor title + bio
    initial: 'H', name: 'Harish', role: 'Mentor', tag: 'Mentor',
    bio: 'Placeholder bio — confirm Harish’s mentorship focus and guidance to the team.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
];

function Socials({ m }: { m: Member }) {
  return (
    <div className="dlw-rost-socials">
      <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}><Linkedin size={15} /></a>
      <a href={m.socials.x} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on X`}><Twitter size={15} /></a>
      <a href={m.socials.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`}><Github size={15} /></a>
    </div>
  );
}

function TierHead({ idx, label, count }: { idx: string; label: string; count: number }) {
  return (
    <div className="dlw-tier-head">
      <span className="dlw-tier-idx">{idx}</span>
      <span className="dlw-tier-label">{label}</span>
      <span className="dlw-tier-rule" />
      <span className="dlw-tier-count dlw-mono">{count.toString().padStart(2, '0')} {count === 1 ? 'person' : 'people'}</span>
    </div>
  );
}

export function TeamSection() {
  return (
    <section className="dlw-section" id="team">
      <div className="dlw-container">
        <div className="dlw-section-head center">
          <div className="dlw-eyebrow"><span className="num">05</span> Team</div>
          <h2 className="dlw-section-title">
            The people building <span className="dlw-text-gradient">the protocol.</span>
          </h2>
          <p className="dlw-section-sub">Three co-founders and the technical core — systems, software, hardware, and the ML brain.</p>
        </div>

        {/* Tier 1 — Founders */}
        <TierHead idx="01" label="Founders" count={founders.length} />
        <div className="dlw-roster is-founders">
          {founders.map((m, i) => (
            <article key={m.name} className="dlw-rost-card">
              <span className="dlw-rost-coord dlw-mono">F-{(i + 1).toString().padStart(2, '0')}</span>
              <div className="dlw-rost-node">{m.initial}<i className="tick tl" /><i className="tick br" /></div>
              <div className="dlw-rost-role dlw-mono">{m.role}</div>
              <h3 className="dlw-rost-name">{m.name}</h3>
              <p className="dlw-rost-bio">{m.bio}</p>
              <div className="dlw-rost-foot">
                <span className="dlw-rost-tag founder dlw-mono">Co-founder</span>
                <Socials m={m} />
              </div>
            </article>
          ))}
        </div>

        {/* Tier 2 — Core Team */}
        <TierHead idx="02" label="Core Team" count={core.length} />
        <div className="dlw-roster is-wide">
          {core.map((m, i) => (
            <article key={m.name} className="dlw-rost-card is-horizontal">
              <div className="dlw-rost-node lg">{m.initial}<i className="tick tl" /><i className="tick br" /></div>
              <div className="dlw-rost-main">
                <span className="dlw-rost-coord dlw-mono">C-{(i + 1).toString().padStart(2, '0')}</span>
                <div className="dlw-rost-role dlw-mono">{m.role}</div>
                <h3 className="dlw-rost-name">{m.name}</h3>
                <p className="dlw-rost-bio">{m.bio}</p>
                <div className="dlw-rost-foot">
                  <span className="dlw-rost-tag core dlw-mono">Core team</span>
                  <Socials m={m} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Tier 3 — Mentors */}
        <TierHead idx="03" label="Mentors" count={mentors.length} />
        <div className="dlw-roster is-wide">
          {mentors.map((m, i) => (
            <article key={m.name} className="dlw-rost-card is-horizontal is-mentor">
              <div className="dlw-rost-node lg">{m.initial}<i className="tick tl" /><i className="tick br" /></div>
              <div className="dlw-rost-main">
                <span className="dlw-rost-coord dlw-mono">M-{(i + 1).toString().padStart(2, '0')}</span>
                <div className="dlw-rost-role dlw-mono">{m.role}</div>
                <h3 className="dlw-rost-name">{m.name}</h3>
                <p className="dlw-rost-bio">{m.bio}</p>
                <div className="dlw-rost-foot">
                  <span className="dlw-rost-tag mentor dlw-mono">Mentor</span>
                  <Socials m={m} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
