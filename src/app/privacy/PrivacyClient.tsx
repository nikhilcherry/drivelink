'use client';
import { LegalPage } from '../../components/legal/LegalPage';
import { legalP, legalH2, legalLi } from '../../lib/legalStyles';

export function PrivacyClient() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      updated="2 September 2026"
      intro="What drivelink.tech collects, why, who it goes to, and how to get it deleted. Written to describe what the site actually does — nothing more."
    >
      <p style={legalP}>
        This policy covers the website at <strong>drivelink.tech</strong> (including{' '}
        <strong>www.drivelink.tech</strong> and <strong>core.drivelink.tech</strong>), operated by DriveLink
        Technologies, Bengaluru, Karnataka, India (&ldquo;DriveLink&rdquo;, &ldquo;we&rdquo;). It does not cover the
        DriveLink protocol, on-vehicle module, or any pilot deployment — none of which are in public operation, and
        each of which will carry its own data agreement when they are.
      </p>

      <h2 style={legalH2}>1. What we collect</h2>
      <p style={legalP}>
        Browsing the site does not require an account, and we do not ask for personal information to read any page.
        We collect personal data in exactly three places:
      </p>
      <ul>
        <li style={legalLi}>
          <strong>Job applications (/hiring).</strong> Your name, email address, phone number, the focus areas you
          select, your answer to &ldquo;why do you want to join DriveLink?&rdquo;, any GitHub / LinkedIn / portfolio
          links you choose to add, an optional free-text note, and your resume file if you upload one.
        </li>
        <li style={legalLi}>
          <strong>Assistant chat.</strong> The messages you type into the on-site assistant, plus the recent turns of
          that conversation, are sent to our server so a reply can be generated. Please do not put confidential or
          sensitive personal information into it.
        </li>
        <li style={legalLi}>
          <strong>Email you send us.</strong> If you contact us or request the investor deck, we hold that email and
          whatever you put in it.
        </li>
      </ul>
      <p style={legalP}>
        Our hosting provider also records standard server logs for every request (IP address, timestamp, requested
        URL, user agent). Those logs exist for security, abuse prevention, and rate limiting.
      </p>

      <h2 style={legalH2}>2. Cookies and analytics</h2>
      <p style={legalP}>
        The site sets no advertising, tracking, or analytics cookies, and runs no third-party analytics or
        advertising scripts. Web fonts are served from our own domain, not from a font CDN, so loading a page does
        not report your visit to a third party. The internal hiring desk keeps its sign-in token in your browser&apos;s
        session storage so it survives a page reload; that token stays on your device, and closing the tab clears it.
      </p>

      <h2 style={legalH2}>3. Why we use it, and on what basis</h2>
      <ul>
        <li style={legalLi}><strong>Applications</strong> — to evaluate you for a role, and to contact you about it.</li>
        <li style={legalLi}><strong>Chat messages</strong> — to answer your question and to stop abuse of the endpoint.</li>
        <li style={legalLi}><strong>Email</strong> — to reply to you.</li>
        <li style={legalLi}><strong>Server logs</strong> — to keep the site available and secure.</li>
      </ul>
      <p style={legalP}>
        Where the GDPR or comparable law applies to you, our bases are your consent (which you give by submitting a
        form or a message, and can withdraw at any time), steps taken at your request before entering a contract
        (recruitment), and our legitimate interest in running a secure website.
      </p>

      <h2 style={legalH2}>4. Who else sees it</h2>
      <p style={legalP}>
        We do not sell personal data, and we do not share it for advertising. We use a small number of service
        providers that process data on our behalf:
      </p>
      <ul>
        <li style={legalLi}><strong>Vercel</strong> — website hosting and server logs.</li>
        <li style={legalLi}><strong>Supabase</strong> — the database holding applications, and the private storage bucket holding resumes.</li>
        <li style={legalLi}><strong>Groq</strong> — the model provider that generates assistant replies from the messages you send it.</li>
      </ul>
      <p style={legalP}>
        These providers operate outside India, so data submitted through this site may be stored or processed abroad.
        We may also disclose data where the law requires it.
      </p>

      <h2 style={legalH2}>5. How long we keep it</h2>
      <p style={legalP}>
        Applications and resumes are kept for up to 24 months from submission so we can consider you for later
        openings, then deleted — sooner if you ask. Emails are kept as long as the correspondence is useful. Server
        logs are kept for the short retention window our host applies. Resumes are stored in a private bucket that
        the website&apos;s public key cannot read back; only the DriveLink team can open them.
      </p>

      <h2 style={legalH2}>6. Your rights</h2>
      <p style={legalP}>
        You can ask us for a copy of the personal data we hold about you, ask us to correct it, or ask us to delete
        it — including withdrawing an application. Email{' '}
        <a href="mailto:tech.drivelink@gmail.com?subject=Privacy%20request">tech.drivelink@gmail.com</a> and we will
        act on it within 30 days. If you are in the EU or UK and believe we have mishandled your data, you may also
        complain to your local supervisory authority.
      </p>

      <h2 style={legalH2}>7. Children</h2>
      <p style={legalP}>
        The site is not directed at children under 16, and we do not knowingly collect their personal data. If you
        believe a child has sent us information, write to us and we will delete it.
      </p>

      <h2 style={legalH2}>8. Changes</h2>
      <p style={legalP}>
        If this policy changes materially, the date at the top of this page changes with it. Contact:{' '}
        <a href="mailto:tech.drivelink@gmail.com?subject=Privacy%20enquiry">tech.drivelink@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
