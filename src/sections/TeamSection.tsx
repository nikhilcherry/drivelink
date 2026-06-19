import { Linkedin, Twitter, Github } from 'lucide-react';

// TODO(founder): add real social URLs (replace the '#' placeholders below)
const team = [
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
  {
    initial: 'S', name: 'Shreyas', role: 'Chief Development Officer', tag: 'Core team',
    bio: 'Architects the RandomForest decision models — lane change, turning, and V2V negotiation — and the real-time inference that drives every car.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
  {
    // TODO(founder): Harish role + bio
    initial: 'H', name: 'Harish', role: 'Core Team', tag: 'Core team',
    bio: 'Placeholder bio — confirm Harish’s focus area and contributions.',
    socials: { linkedin: '#', x: '#', github: '#' },
  },
];

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

        <div className="dlw-team-grid is-four">
          {team.map((m, i) => (
            <div key={i} className="dlw-team-card">
              <span className={'dlw-team-tag ' + (m.tag === 'Co-founder' ? 'founder' : 'core')}>{m.tag}</span>
              <div className="dlw-team-portrait">{m.initial}</div>
              <div className="dlw-team-role">{m.role}</div>
              <h3 className="dlw-team-name">{m.name}</h3>
              <p className="dlw-team-bio">{m.bio}</p>
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
  );
}
