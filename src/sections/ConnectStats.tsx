interface ConnectStat {
  value: string;
  label: string;
  subtext: string;
}

const stats: ConnectStat[] = [
  {
    value: '0',
    label: 'Phone numbers exposed',
    subtext: 'Complete end-to-end privacy for both owner and scanner.',
  },
  {
    value: '<3s',
    label: 'Time to alert',
    subtext: 'Camera opens the browser chat session instantly with zero app download.',
  },
  {
    value: '100%',
    label: 'Weatherproof',
    subtext: 'Industrial-grade vinyl rated for severe UV, rain, and windshield heat.',
  },
  {
    value: '2-Way',
    label: 'Encrypted messaging',
    subtext: 'Pre-set quick replies and custom notifications without spam.',
  },
];

export function ConnectStats() {
  return (
    <section className="dlw-stats" aria-labelledby="connect-stats-heading">
      <div className="dlw-container">
        {/* Visually hidden heading so the section is reachable via landmarks */}
        <h2 id="connect-stats-heading" className="dlw-sr-only">
          DriveLink Connect — key metrics
        </h2>

        <div className="dlw-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="dlw-stat">
              {/* Monospaced label above the large value */}
              <div className="label">{s.label}</div>

              {/* Large number — no separate `unit` span needed since the
                  values already embed their suffix (e.g. "<3s", "100%") */}
              <div className="value">
                <span>{s.value}</span>
              </div>

              {/* Descriptive subtext below */}
              <div className="caption">{s.subtext}</div>
            </div>
          ))}
        </div>

        <p className="dlw-stats-note">
          DriveLink Connect product specifications. Privacy guarantees are enforced by design —
          the system never stores or transmits either party&apos;s phone number at any stage of the
          interaction.
        </p>
      </div>
    </section>
  );
}
