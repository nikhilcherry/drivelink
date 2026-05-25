const team = [
  {
    initial: 'H', name: 'Hruday', role: 'CEO · Chief Systems Architect',
    bio: 'Leads vision, protocol architecture, partnerships, and the long-term standardization roadmap.',
  },
  {
    initial: 'N', name: 'Nikhil', role: 'CTO · Computer Science',
    bio: 'Builds the prediction engine, simulation environment, and V2V messaging intelligence.',
  },
  {
    initial: 'K', name: 'Krishna', role: 'CPO · Mechanical Engineering',
    bio: 'Handles hardware feasibility, integration, mechanical systems, and real-vehicle interfacing.',
  },
];

export function TeamSection() {
  return (
    <section className="dlw-section" id="team">
      <div className="dlw-container">
        <div className="dlw-section-head center">
          <div className="dlw-eyebrow"><span className="num">05</span> Team</div>
          <h2 className="dlw-section-title">
            Three founders. <span className="dlw-text-gradient">One protocol.</span>
          </h2>
          <p className="dlw-section-sub">Systems, software, and hardware — built end to end.</p>
        </div>

        <div className="dlw-team-grid">
          {team.map((m, i) => (
            <div key={i} className="dlw-team-card">
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
