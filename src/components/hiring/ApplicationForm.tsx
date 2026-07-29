'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Check, FileText, Upload } from 'lucide-react';
import {
  ALLOWED_RESUME_EXTENSIONS,
  MAX_RESUME_BYTES,
  insertApplication,
  resumeExtension,
  supabaseConfigured,
  uploadResume,
  type ApplicationRow,
  type FocusArea,
} from '../../lib/supabase';
import { LINK_FIELDS, parseLink, validateName, validateNote, validatePhone } from '../../lib/applicantValidation';

const FOCUS_AREAS: { id: FocusArea; label: string; sub: string }[] = [
  { id: 'ml', label: 'ML', sub: 'Prediction, intent models, training' },
  { id: 'iot', label: 'IoT', sub: 'Embedded, radio, hardware-in-the-loop' },
  { id: 'rnd', label: 'R&D', sub: 'Protocol design, simulation, papers' },
];

type Errors = Partial<Record<string, string>>;
type Status = 'idle' | 'uploading' | 'submitting' | 'done';

const MAX_MB = Math.round(MAX_RESUME_BYTES / (1024 * 1024));

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApplicationForm() {
  const [focus, setFocus] = useState<FocusArea[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [submitError, setSubmitError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const busy = status === 'uploading' || status === 'submitting';

  function toggleFocus(id: FocusArea) {
    setFocus((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
    setErrors((prev) => ({ ...prev, focus: undefined }));
  }

  /** The `accept` attribute is only a hint — the real check runs on the File. */
  function acceptFile(next: File | null) {
    if (!next) return;
    const ext = resumeExtension(next.name);
    if (!(ALLOWED_RESUME_EXTENSIONS as readonly string[]).includes(ext)) {
      setFile(null);
      setErrors((prev) => ({ ...prev, resume: `That's a .${ext || '?'} file — use PDF, DOC, or DOCX.` }));
      return;
    }
    if (next.size > MAX_RESUME_BYTES) {
      setFile(null);
      setErrors((prev) => ({ ...prev, resume: `That file is ${formatSize(next.size)} — the limit is ${MAX_MB} MB.` }));
      return;
    }
    setFile(next);
    setErrors((prev) => ({ ...prev, resume: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setSubmitError('');

    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();

    // Honeypot: a real person never fills a field they cannot see. Pretend it
    // worked rather than explaining the trap to whatever filled it.
    if (get('company_website')) {
      setStatus('done');
      return;
    }

    const fullName = get('full_name');
    const email = get('email');
    const phone = get('phone');
    const note = get('note');

    const github = parseLink(get('github_url'), LINK_FIELDS.github);
    const linkedin = parseLink(get('linkedin_url'), LINK_FIELDS.linkedin);
    const portfolio = parseLink(get('portfolio_url'), LINK_FIELDS.portfolio);

    // Optional fields: an empty value is fine, a malformed one is not. Only
    // defined messages are kept, so Object.keys() below counts real failures.
    const next: Errors = Object.fromEntries(
      (
        [
          ['full_name', validateName(fullName)],
          ['email', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? undefined : 'Please enter a valid email address.'],
          ['phone', validatePhone(phone)],
          ['github_url', github.error],
          ['linkedin_url', linkedin.error],
          ['portfolio_url', portfolio.error],
          ['note', validateNote(note)],
          ['focus', focus.length ? undefined : 'Pick at least one focus area.'],
        ] as const
      ).filter(([, message]) => message)
    );

    setErrors(next);
    if (Object.keys(next).length) {
      // Wait a frame: setErrors hasn't committed yet, so querying for
      // [aria-invalid] in this tick finds nothing and focus would stay on the
      // submit button — leaving a screen-reader user with no idea what failed.
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        first?.focus();
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }

    if (!supabaseConfigured) {
      setSubmitError('Applications aren’t accepting submissions just yet. Email tech.drivelink@gmail.com and we’ll pick it up from there.');
      return;
    }

    try {
      let resumePath: string | null = null;
      if (file) {
        setStatus('uploading');
        resumePath = await uploadResume(file);
      }

      setStatus('submitting');
      const row: ApplicationRow = {
        full_name: fullName,
        email,
        phone,
        github_url: github.url,
        linkedin_url: linkedin.url,
        portfolio_url: portfolio.url,
        resume_path: resumePath,
        domain: 'tech',
        focus_areas: focus,
        note: note || null,
      };
      await insertApplication(row);

      setStatus('done');
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (error) {
      // Every field stays as typed — nothing gets retyped after a failure.
      setStatus('idle');
      setSubmitError(
        error instanceof Error && /upload/i.test(error.message)
          ? 'We couldn’t upload your resume. Check your connection and try again.'
          : 'Something went wrong submitting your application. Please try again, or email tech.drivelink@gmail.com.'
      );
    }
  }

  if (status === 'done') {
    return (
      <div className="dlw-form-done" ref={doneRef} tabIndex={-1}>
        <div className="dlw-form-done-mark"><Check size={28} /></div>
        <h2>Application received.</h2>
        <p>
          Thanks for putting this together. We read every application ourselves — if there&apos;s a fit,
          you&apos;ll hear from us at the email you gave.
        </p>
        <Link className="dlw-btn dlw-btn-ghost" href="/">Back to home</Link>
      </div>
    );
  }

  const err = (k: string) => errors[k];

  return (
    <form className="dlw-form" ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* ── Basic information ─────────────────────────────── */}
      <fieldset className="dlw-fieldset">
        <legend className="dlw-eyebrow"><span className="num">1</span> Basic information</legend>

        <div className="dlw-form-grid">
          <div className="dlw-field">
            <label className="dlw-label" htmlFor="full_name">Full name</label>
            <input
              className="dlw-input" id="full_name" name="full_name" type="text"
              autoComplete="name" placeholder="Ada Lovelace"
              aria-invalid={err('full_name') ? true : undefined}
              aria-describedby={err('full_name') ? 'full_name-error' : undefined}
            />
            {err('full_name') && <span className="dlw-field-error" id="full_name-error">{err('full_name')}</span>}
          </div>

          <div className="dlw-field">
            <label className="dlw-label" htmlFor="email">Email</label>
            <input
              className="dlw-input" id="email" name="email" type="email"
              autoComplete="email" placeholder="you@example.com"
              aria-invalid={err('email') ? true : undefined}
              aria-describedby={err('email') ? 'email-error' : undefined}
            />
            {err('email') && <span className="dlw-field-error" id="email-error">{err('email')}</span>}
          </div>

          <div className="dlw-field full">
            <label className="dlw-label" htmlFor="phone">Phone</label>
            <input
              className="dlw-input" id="phone" name="phone" type="tel"
              autoComplete="tel" placeholder="+91 98765 43210"
              aria-invalid={err('phone') ? true : undefined}
              aria-describedby={err('phone') ? 'phone-error' : undefined}
            />
            {err('phone') && <span className="dlw-field-error" id="phone-error">{err('phone')}</span>}
          </div>
        </div>
      </fieldset>

      {/* ── Links ─────────────────────────────────────────── */}
      <fieldset className="dlw-fieldset">
        <legend className="dlw-eyebrow"><span className="num">2</span> Links</legend>
        <p className="dlw-fieldset-note">
          All optional — share whatever represents your work best. A handle is fine; we&apos;ll expand it.
        </p>

        <div className="dlw-form-grid">
          <div className="dlw-field">
            <label className="dlw-label" htmlFor="github_url">GitHub <span className="opt">optional</span></label>
            <input
              className="dlw-input" id="github_url" name="github_url" type="text"
              placeholder="github.com/yourname"
              aria-invalid={err('github_url') ? true : undefined}
              aria-describedby={err('github_url') ? 'github_url-error' : undefined}
            />
            {err('github_url') && <span className="dlw-field-error" id="github_url-error">{err('github_url')}</span>}
          </div>

          <div className="dlw-field">
            <label className="dlw-label" htmlFor="linkedin_url">LinkedIn <span className="opt">optional</span></label>
            <input
              className="dlw-input" id="linkedin_url" name="linkedin_url" type="text"
              placeholder="linkedin.com/in/yourname"
              aria-invalid={err('linkedin_url') ? true : undefined}
              aria-describedby={err('linkedin_url') ? 'linkedin_url-error' : undefined}
            />
            {err('linkedin_url') && <span className="dlw-field-error" id="linkedin_url-error">{err('linkedin_url')}</span>}
          </div>

          <div className="dlw-field full">
            <label className="dlw-label" htmlFor="portfolio_url">Portfolio <span className="opt">optional</span></label>
            <input
              className="dlw-input" id="portfolio_url" name="portfolio_url" type="text"
              placeholder="yoursite.com"
              aria-invalid={err('portfolio_url') ? true : undefined}
              aria-describedby={err('portfolio_url') ? 'portfolio_url-error' : undefined}
            />
            {err('portfolio_url') && <span className="dlw-field-error" id="portfolio_url-error">{err('portfolio_url')}</span>}
          </div>
        </div>
      </fieldset>

      {/* ── Resume ────────────────────────────────────────── */}
      <fieldset className="dlw-fieldset">
        <legend className="dlw-eyebrow"><span className="num">3</span> Resume <span className="opt">optional</span></legend>

        <div
          className={
            'dlw-dropzone' +
            (dragging ? ' is-dragging' : '') +
            (file ? ' has-file' : '') +
            (err('resume') ? ' has-error' : '')
          }
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0] ?? null); }}
        >
          <input
            id="resume" name="resume" type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
            aria-label="Resume"
            aria-invalid={err('resume') ? true : undefined}
            aria-describedby={err('resume') ? 'resume-error' : 'resume-hint'}
          />
          {file ? (
            <>
              <span className="dlw-dropzone-file"><FileText size={16} /> {file.name}</span>
              <span className="dlw-dropzone-sub">{formatSize(file.size)} · click to replace</span>
            </>
          ) : (
            <>
              <Upload size={20} color="#0f4c81" />
              <span className="dlw-dropzone-title">Drop your resume here, or click to browse</span>
              <span className="dlw-dropzone-sub" id="resume-hint">PDF, DOC, or DOCX · up to {MAX_MB} MB</span>
            </>
          )}
        </div>
        {err('resume') && (
          <span className="dlw-field-error" id="resume-error" style={{ marginTop: 8, display: 'block' }}>
            {err('resume')}
          </span>
        )}
      </fieldset>

      {/* ── Domain & focus ────────────────────────────────── */}
      <fieldset className="dlw-fieldset">
        <legend className="dlw-eyebrow"><span className="num">4</span> Domain &amp; focus</legend>

        <div className="dlw-field" style={{ marginBottom: 26 }}>
          <span className="dlw-label" id="domain-label">Domain</span>
          <div className="dlw-choice-grid single" role="group" aria-labelledby="domain-label">
            <label className="dlw-choice">
              <input type="radio" name="domain" value="tech" defaultChecked />
              <span className="dlw-choice-body">
                <span className="dlw-choice-title">Tech</span>
                <span className="dlw-choice-sub">Protocol, ML, embedded systems, simulation</span>
              </span>
            </label>
          </div>
          <span className="dlw-field-hint">More domains opening up soon.</span>
        </div>

        <div className="dlw-field">
          <span className="dlw-label" id="focus-label">Focus areas <span className="opt">select all that apply</span></span>
          <div
            className="dlw-choice-grid"
            role="group"
            aria-labelledby="focus-label"
            aria-describedby={err('focus') ? 'focus-error' : undefined}
          >
            {FOCUS_AREAS.map((f) => (
              <label className="dlw-choice" key={f.id}>
                <input
                  type="checkbox"
                  name="focus_areas"
                  value={f.id}
                  checked={focus.includes(f.id)}
                  onChange={() => toggleFocus(f.id)}
                  aria-invalid={err('focus') ? true : undefined}
                />
                <span className="dlw-choice-body">
                  <span className="dlw-choice-title">{f.label}</span>
                  <span className="dlw-choice-sub">{f.sub}</span>
                </span>
              </label>
            ))}
          </div>
          {err('focus') && <span className="dlw-field-error" id="focus-error">{err('focus')}</span>}
        </div>

        <div className="dlw-field" style={{ marginTop: 26 }}>
          <label className="dlw-label" htmlFor="note">Anything else? <span className="opt">optional</span></label>
          <textarea
            className="dlw-textarea" id="note" name="note" maxLength={2000}
            placeholder="A project you're proud of, why V2V, what you want to build here."
            aria-invalid={err('note') ? true : undefined}
            aria-describedby={err('note') ? 'note-error' : undefined}
          />
          {err('note') && <span className="dlw-field-error" id="note-error">{err('note')}</span>}
        </div>
      </fieldset>

      {/* Bot bait — off-screen, never announced, never reachable by tabbing. */}
      <div className="dlw-hp" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="dlw-form-foot">
        {!supabaseConfigured && (
          <p className="dlw-form-status warn" role="status">
            Heads up — submissions aren&apos;t wired up in this environment yet.
          </p>
        )}
        {submitError && <p className="dlw-form-status err" role="status" aria-live="polite">{submitError}</p>}
        <p className="dlw-form-consent">
          We store what you send here only to evaluate your application. Your resume is kept private —
          it is never published or shared outside the team.
        </p>
        <div>
          <button className="dlw-btn dlw-btn-primary" type="submit" disabled={busy}>
            {status === 'uploading' ? 'Uploading resume…' : status === 'submitting' ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      </div>
    </form>
  );
}
