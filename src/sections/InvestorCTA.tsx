interface InvestorCTAProps {
  onPartner: () => void;
}

export function InvestorCTA({ onPartner }: InvestorCTAProps) {
  return (
    <section className="dlw-cta" id="cta">
      <div className="dlw-cta-inner">
        <div className="dlw-eyebrow dlw-cta-eyebrow">
          <span className="num" style={{ background: 'rgba(255,255,255,0.1)', color: '#60a5fa' }}>07</span>
          {' '}For investors & partners
        </div>
        <h2>
          Build the <span className="dlw-text-gradient-down">automotive AI backbone</span> with us.
        </h2>
        <p>
          &ldquo;Investors, OEMs, fleets, and mobility partners — let&apos;s set the standard for cooperative mobility.&rdquo;
        </p>
        <div className="dlw-cta-row">
          <button className="dlw-btn dlw-btn-dark" onClick={onPartner}>Partner with DriveLink</button>
          <a className="dlw-btn dlw-btn-on-dark-ghost" href="mailto:tech.drivelink@gmail.com">Request investor deck</a>
        </div>
        <div className="dlw-cta-contact">
          <span>tech.drivelink@gmail.com</span>
          <span>·</span>
          <span>drivelink.tech</span>
          <span>·</span>
          <span>Bangalore, India</span>
        </div>
      </div>
    </section>
  );
}
