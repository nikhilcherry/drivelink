const team = [
  {
    initial: 'H', name: 'Hruday', role: 'CEO · Chief Systems Architect', tag: 'Co-founder',
    bio: 'Leads vision, protocol architecture, partnerships, and the long-term standardization roadmap.',
  },
  {
    initial: 'N', name: 'Nikhil', role: 'CTO · Computer Science', tag: 'Co-founder',
    bio: 'Builds the prediction engine, simulation environment, and V2V messaging intelligence.',
  },
  {
    initial: 'K', name: 'Krishna', role: 'CPO · Mechanical Engineering', tag: 'Co-founder',
    bio: 'Handles hardware feasibility, integration, mechanical systems, and real-vehicle interfacing.',
  },
  {
    initial: 'S', name: 'Shreyas', role: 'Lead ML Engineer · Decision Models', tag: 'Core team',
    bio: 'Architects the RandomForest decision models — lane change, turning, and V2V negotiation — and the real-time inference that drives every car.',
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
