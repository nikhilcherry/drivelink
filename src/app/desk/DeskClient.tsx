'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DESK_ENDPOINT } from '../../lib/supabase';
import './desk.css';

/**
 * The hiring desk UI.
 *
 * Every call goes to the `hiring-desk` edge function, never to PostgREST — the
 * anon key this site ships cannot read `applications` at all (migration 0005
 * revoked the grant), so there is no path from this page to applicant data that
 * doesn't go through the password check. That is deliberate: it means shipping
 * a bug in this file cannot leak anyone's email.
 */

const STATUSES = ['new', 'shortlisted', 'completed', 'selected', 'rejected'] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: 'New',
  shortlisted: 'Shortlisted',
  completed: 'Completed',
  selected: 'Selected',
  rejected: 'Rejected',
};

/** Mirrors FOCUS_AREAS in src/components/hiring/ApplicationForm.tsx. */
const FOCUS_LABEL: Record<string, string> = {
  appdev: 'App Development',
  webdev: 'Web Development',
  ml: 'Machine Learning',
  ros: 'Robotics · ROS',
  iot: 'IoT & Embedded',
  rnd: 'R&D',
};

interface Application {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_path: string | null;
  domain: string;
  focus_areas: string[];
  note: string | null;
  why_join: string | null;
  status: Status;
  remarks: string | null;
  status_updated_at: string | null;
}

const TOKEN_KEY = 'dl-desk-token';

/** sessionStorage, not localStorage: closing the tab ends the session. This is
 *  a list of people's phone numbers on what may be a shared laptop. */
const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const writeToken = (t: string | null) => {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
};

async function call(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch(DESK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

const errText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function DeskClient() {
  const [phase, setPhase] = useState<'loading' | 'setup' | 'login' | 'ready'>('loading');
  const [setupOpen, setSetupOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const enter = useCallback((t: string, list: Application[]) => {
    writeToken(t);
    setToken(t);
    setApps(list);
    setPhase('ready');
    setError('');
  }, []);

  const signOutLocal = useCallback(() => {
    writeToken(null);
    setToken(null);
    setApps([]);
    setSelectedId(null);
    setPhase('login');
  }, []);

  // Boot: reuse a live session if the tab still has one, else show the gate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = readToken();
      if (saved) {
        try {
          const d = await call('list', { token: saved });
          if (!cancelled) enter(saved, d.applications);
          return;
        } catch {
          writeToken(null); // expired or revoked — fall through to the gate
        }
      }
      try {
        const s = await call('status');
        if (cancelled) return;
        setSetupOpen(Boolean(s.setup_open));
        setPhase(s.needs_setup ? 'setup' : 'login');
      } catch (e) {
        if (cancelled) return;
        setError(errText(e));
        setPhase('login');
      }
    })();
    return () => { cancelled = true; };
  }, [enter]);

  /** Authenticated call that drops the session locally if the server rejects it. */
  const api = useCallback(
    async (action: string, payload: Record<string, unknown> = {}) => {
      try {
        return await call(action, { ...payload, token });
      } catch (e) {
        if (errText(e).startsWith('Session expired')) signOutLocal();
        throw e;
      }
    },
    [token, signOutLocal],
  );

  const patchLocal = useCallback((next: Application) => {
    setApps((prev) => prev.map((a) => (a.id === next.id ? next : a)));
  }, []);

  const dropLocal = useCallback((id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  // On a phone the list and the detail occupy the same column, so moving
  // between them is a navigation, not a reveal: start it at the top rather
  // than at whatever offset the list happened to be scrolled to.
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const s of STATUSES) c[s] = 0;
    for (const a of apps) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? '').toLowerCase().includes(q) ||
        a.focus_areas.some((f) => (FOCUS_LABEL[f] ?? f).toLowerCase().includes(q))
      );
    });
  }, [apps, filter, query]);

  // Resolved against every application, not the filtered list: moving someone
  // out of the tab you're on shouldn't yank the panel you're typing notes into.
  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId],
  );

  if (phase === 'loading') {
    return (
      <div className="dlk">
        <div className="dlk-gate"><p className="dlk-gate-sub">Loading…</p></div>
      </div>
    );
  }

  if (phase === 'setup' || phase === 'login') {
    return (
      <div className="dlk">
        <Gate
          mode={phase}
          setupOpen={setupOpen}
          initialError={error}
          onIn={async (t) => {
            const d = await call('list', { token: t });
            enter(t, d.applications);
          }}
        />
      </div>
    );
  }

  return (
    <div className="dlk" ref={rootRef}>
      <header className="dlk-head">
        <h1 className="dlk-head-title">DriveLink <span>hiring desk</span></h1>
        <span className="dlk-head-spacer" />
        <input
          className="dlk-input dlk-search"
          type="search"
          placeholder="Search name, email, phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search applications"
        />
        <button className="dlk-btn dlk-btn-ghost dlk-btn-sm" onClick={() => setShowPw((v) => !v)}>
          {showPw ? 'Close' : 'Password'}
        </button>
        <button
          className="dlk-btn dlk-btn-ghost dlk-btn-sm"
          onClick={async () => {
            try { await api('logout'); } catch { /* leaving anyway */ }
            signOutLocal();
          }}
        >
          Sign out
        </button>
      </header>

      {showPw && <ChangePassword api={api} onDone={(t) => { writeToken(t); setToken(t); setShowPw(false); }} />}

      <div className="dlk-tabs" role="tablist" aria-label="Filter by status">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={filter === s}
            className="dlk-tab"
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
            <span className="dlk-tab-n">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="dlk-body" data-view={selected ? 'detail' : 'list'}>
        <div className="dlk-list">
          {visible.length === 0 && (
            <p className="dlk-empty">
              {apps.length === 0 ? 'No applications yet.' : 'Nothing matches that filter.'}
            </p>
          )}
          {visible.map((a) => (
            <button
              key={a.id}
              className="dlk-row"
              aria-current={a.id === selectedId}
              onClick={() => setSelectedId(a.id === selectedId ? null : a.id)}
            >
              <span className="dlk-row-top">
                <span className={`dlk-pill dlk-pill-${a.status}`}>{STATUS_LABEL[a.status]}</span>
                <span className="dlk-row-name">{a.full_name}</span>
              </span>
              <span className="dlk-row-mail">{a.email}</span>
              <span className="dlk-row-meta">
                <span>{fmtDate(a.created_at)}</span>
                <span>·</span>
                <span>{a.focus_areas.map((f) => FOCUS_LABEL[f] ?? f).join(', ') || '—'}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="dlk-detail-pane">
          {selected ? (
            <Detail
              key={selected.id}
              app={selected}
              api={api}
              onPatch={patchLocal}
              onDelete={dropLocal}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <p className="dlk-empty">Pick someone from the list to see everything they sent.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ the gate */

function Gate({
  mode,
  setupOpen,
  initialError,
  onIn,
}: {
  mode: 'setup' | 'login';
  setupOpen: boolean;
  initialError: string;
  onIn: (token: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);

  const isSetup = mode === 'setup';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isSetup) {
      if (password.length < 10) return setError('Use at least 10 characters.');
      if (password !== confirm) return setError('The two passwords don’t match.');
    }
    setBusy(true);
    try {
      const d = await call(isSetup ? 'setup' : 'login', { password });
      await onIn(d.token);
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  // The setup window has lapsed and nobody claimed the desk — a password must
  // now be set deliberately rather than by whoever loads the page.
  if (isSetup && !setupOpen) {
    return (
      <div className="dlk-gate">
        <div className="dlk-gate-card">
          <div className="dlk-gate-mark">DriveLink</div>
          <h1 className="dlk-gate-title">Setup window closed</h1>
          <p className="dlk-gate-sub">
            No password was set in time, so this desk can’t be claimed from the browser any more.
            Reopen it from the Supabase SQL editor, then reload:
          </p>
          <p className="dlk-prose dlk-mono">
            update public.desk_auth set setup_deadline = now() + interval &apos;1 hour&apos;;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dlk-gate">
      <div className="dlk-gate-card">
        <div className="dlk-gate-mark">DriveLink</div>
        <h1 className="dlk-gate-title">{isSetup ? 'Set the desk password' : 'Hiring desk'}</h1>
        <p className="dlk-gate-sub">
          {isSetup
            ? 'Nobody has claimed this desk yet. The password you set here is the only way in afterwards — pick something you can share with the founders and store it somewhere safe.'
            : 'Enter the shared password to see applications.'}
        </p>
        <form onSubmit={submit}>
          <input
            className="dlk-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={isSetup ? 'new-password' : 'current-password'}
            aria-label="Password"
            autoFocus
          />
          {isSetup && (
            <input
              className="dlk-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              aria-label="Confirm password"
            />
          )}
          {error && <p className="dlk-error">{error}</p>}
          <button className="dlk-btn dlk-btn-primary" type="submit" disabled={busy || !password}>
            {busy ? 'Checking…' : isSetup ? 'Set password & open desk' : 'Open desk'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- the detail */

function Detail({
  app,
  api,
  onPatch,
  onDelete,
  onBack,
}: {
  app: Application;
  api: (action: string, payload?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  onPatch: (a: Application) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}) {
  const [remarks, setRemarks] = useState(app.remarks ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = remarks !== (app.remarks ?? '');

  async function run(action: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      const d = await api(action, { id: app.id, ...payload });
      if (d.application) onPatch(d.application as Application);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function openResume() {
    setBusy(true);
    setError('');
    try {
      const d = await api('resume_url', { id: app.id });
      window.open(String(d.url), '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dlk-detail">
      <button className="dlk-back" onClick={onBack}>← All applications</button>
      <h2 className="dlk-detail-name">{app.full_name}</h2>
      <p className="dlk-detail-when">
        Applied {fmtDate(app.created_at)}
        {app.status_updated_at && ` · moved to ${STATUS_LABEL[app.status].toLowerCase()} ${fmtDate(app.status_updated_at)}`}
      </p>

      <div className="dlk-fields">
        <Field k="Email"><a href={`mailto:${app.email}`}>{app.email}</a></Field>
        <Field k="Phone"><a href={`tel:${app.phone}`}>{app.phone}</a></Field>
        <Field k="GitHub" url={app.github_url} />
        <Field k="LinkedIn" url={app.linkedin_url} />
        <Field k="Portfolio" url={app.portfolio_url} />
        {app.location && <Field k="Location">{app.location}</Field>}
        <div className="dlk-field full">
          <span className="dlk-k">Focus areas</span>
          <div className="dlk-chips">
            {app.focus_areas.length
              ? app.focus_areas.map((f) => <span key={f} className="dlk-chip">{FOCUS_LABEL[f] ?? f}</span>)
              : <span className="dlk-v empty">None given</span>}
          </div>
        </div>
        {app.why_join && (
          <div className="dlk-field full">
            <span className="dlk-k">Why DriveLink</span>
            <p className="dlk-prose">{app.why_join}</p>
          </div>
        )}
        {app.note && (
          <div className="dlk-field full">
            <span className="dlk-k">Anything else</span>
            <p className="dlk-prose">{app.note}</p>
          </div>
        )}
      </div>

      <div className="dlk-sec">
        <p className="dlk-sec-title">Move to</p>
        <div className="dlk-actions">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`dlk-btn dlk-btn-sm ${s === app.status ? 'dlk-btn-primary' : 'dlk-btn-ghost'}`}
              disabled={busy || s === app.status}
              onClick={() => run('update', { status: s })}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="dlk-sec">
        <p className="dlk-sec-title">Notes</p>
        <textarea
          className="dlk-input dlk-textarea"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Interview notes, who spoke to them, what to do next…"
          maxLength={4000}
          aria-label="Notes"
        />
        <div className="dlk-note-foot">
          <button
            className="dlk-btn dlk-btn-primary dlk-btn-sm"
            disabled={busy || !dirty}
            onClick={() => run('update', { remarks })}
          >
            {busy ? 'Saving…' : 'Save notes'}
          </button>
          {saved && !dirty && <span className="dlk-saved">Saved</span>}
        </div>
      </div>

      <div className="dlk-sec">
        <p className="dlk-sec-title">Files</p>
        <div className="dlk-actions">
          <button
            className="dlk-btn dlk-btn-ghost dlk-btn-sm"
            disabled={busy || !app.resume_path}
            onClick={openResume}
          >
            {app.resume_path ? 'Open resume' : 'No resume attached'}
          </button>
          {/* Two clicks, not a browser confirm() — a modal dialog here would be
              easy to dismiss by reflex, and this is the one irreversible action. */}
          {confirmDelete ? (
            <>
              <button
                className="dlk-btn dlk-btn-danger dlk-btn-sm dlk-btn-wide"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try { await api('delete', { id: app.id }); onDelete(app.id); }
                  catch (e) { setError(errText(e)); setBusy(false); }
                }}
              >
                Really delete — this can’t be undone
              </button>
              <button className="dlk-btn dlk-btn-ghost dlk-btn-sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="dlk-btn dlk-btn-danger dlk-btn-sm" disabled={busy} onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}
        </div>
        {app.resume_path && (
          <p className="dlk-v" style={{ marginTop: 8, fontSize: 12, color: 'var(--fg4)' }}>
            Links expire after an hour.
          </p>
        )}
      </div>

      {error && <p className="dlk-error" style={{ marginTop: 14 }}>{error}</p>}
    </div>
  );
}

function Field({ k, url, children }: { k: string; url?: string | null; children?: React.ReactNode }) {
  if (url !== undefined && !url) {
    return (
      <div className="dlk-field">
        <span className="dlk-k">{k}</span>
        <span className="dlk-v empty">Not given</span>
      </div>
    );
  }
  return (
    <div className="dlk-field">
      <span className="dlk-k">{k}</span>
      <span className="dlk-v">
        {url ? <a href={url} target="_blank" rel="noopener noreferrer">{url.replace(/^https?:\/\//, '')}</a> : children}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------- password change */

function ChangePassword({
  api,
  onDone,
}: {
  api: (action: string, payload?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  onDone: (token: string) => void;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <div style={{ padding: '16px 22px 0' }}>
      <form
        className="dlk-gate-card"
        style={{ maxWidth: 420, padding: 20 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          if (next.length < 10) return setError('Use at least 10 characters.');
          setBusy(true);
          try {
            const d = await api('change_password', { current, next });
            onDone(String(d.token));
          } catch (err) {
            setError(errText(err));
            setBusy(false);
          }
        }}
      >
        <p className="dlk-sec-title" style={{ marginTop: 0 }}>Change the shared password</p>
        <p className="dlk-gate-sub" style={{ marginBottom: 14 }}>
          Everyone else signed in right now gets signed out.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="dlk-input" type="password" placeholder="Current password"
            autoComplete="current-password" aria-label="Current password"
            value={current} onChange={(e) => setCurrent(e.target.value)}
          />
          <input
            className="dlk-input" type="password" placeholder="New password"
            autoComplete="new-password" aria-label="New password"
            value={next} onChange={(e) => setNext(e.target.value)}
          />
          {error && <p className="dlk-error">{error}</p>}
          <button className="dlk-btn dlk-btn-primary" type="submit" disabled={busy || !current || !next}>
            {busy ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  );
}
