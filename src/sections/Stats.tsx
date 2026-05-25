const stats = [
  { label: 'End-to-end latency', value: '<50', unit: 'ms', caption: 'From bus read to neighbor receipt.' },
  { label: 'Prediction window', value: '1.5', unit: 's', caption: 'Probabilistic trajectory cone.' },
  { label: 'Payload size', value: '256', unit: 'B', caption: 'Per intent broadcast, gossip-friendly.' },
  { label: 'Cross-OEM ready', value: 'v0.1', unit: '', caption: 'Vendor-neutral protocol spec.' },
];

export function Stats() {
  return (
    <section className="dlw-stats">
      <div className="dlw-container">
        <div className="dlw-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="dlw-stat">
              <div className="label">{s.label}</div>
              <div className="value">
                <span>{s.value}</span>
                {s.unit && <span className="unit">{s.unit}</span>}
              </div>
              <div className="caption">{s.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
