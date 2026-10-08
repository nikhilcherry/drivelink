interface InvestorCTAProps {
  onPartner: () => void;
}

export function InvestorCTA({ onPartner }: InvestorCTAProps) {
  return (
    <section className="dlw-cta" id="cta">
      <div className="dlw-cta-inner">
        <div className="dlw-eyebrow dlw-cta-eyebrow">
          <span className="num" style={{ background: 'rgba(255,255,255,0.1)', color: '#60a5fa' }}>06</span>
          {' '}For partners & fleets
        </div>
        <h2>
          Scale <span className="dlw-text-gradient-down">private vehicle communication</span> with us.
        </h2>
        <p>
          For fleets, residential communities, and mobility partners looking to eliminate parking friction and vehicle identity leaks.
        </p>
        <div className="dlw-cta-row">
          <button className="dlw-btn dlw-btn-dark" onClick={onPartner}>Get in Touch</button>
          <a className="dlw-btn dlw-btn-on-dark-ghost" href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20Connect%20Inquiry">Contact Team</a>
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
