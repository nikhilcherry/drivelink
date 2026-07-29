/**
 * Input sanity checks for the hiring form (src/components/hiring/ApplicationForm.tsx).
 *
 * These reject junk, not people. Every rule here errs toward letting an unusual
 * real answer through rather than blocking it — a false rejection on a job
 * application costs a candidate, which is far worse than a junk row we can
 * delete. The database CHECK constraints remain the real backstop.
 */

/** Obvious keyboard runs, checked in both directions. */
const KEYBOARD_RUNS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'azerty', '1234567890'];

function hasKeyboardRun(lower: string): boolean {
  const stripped = lower.replace(/[^a-z0-9]/g, '');
  if (stripped.length < 4) return false;
  for (const row of KEYBOARD_RUNS) {
    const back = [...row].reverse().join('');
    for (let i = 0; i + 4 <= row.length; i++) {
      if (stripped.includes(row.slice(i, i + 4))) return true;
      if (stripped.includes(back.slice(i, i + 4))) return true;
    }
  }
  return false;
}

/** "aaaa", "hehehehe" — one character or a short unit repeated to fill space. */
function isRepetitive(lower: string): boolean {
  const stripped = lower.replace(/[^a-z0-9]/g, '');
  if (stripped.length < 4) return false;
  if (/(.)\1{3,}/.test(stripped)) return true;
  // A 1-3 char unit repeated 4+ times, e.g. "hehehehe", "abcabcabcabc".
  return /^(.{1,3}?)\1{3,}$/.test(stripped);
}

/**
 * Names are the easiest field to over-police: they carry particles, hyphens,
 * apostrophes, and non-Latin scripts. So reject only what cannot be a name —
 * digits, no letters at all, keyboard mash, or a repeated unit.
 */
export function validateName(value: string): string | undefined {
  const v = value.trim();
  if (v.length < 2) return 'Please enter your full name.';
  if (v.length > 120) return 'That name is too long.';
  if (/\d/.test(v)) return 'Names shouldn’t contain numbers.';
  // \p{L} keeps this script-agnostic — Devanagari, Han, Cyrillic all pass.
  const letters = v.match(/\p{L}/gu)?.length ?? 0;
  if (letters < 2) return 'Please enter your name using letters.';
  if (/[^\p{L}\p{M}\s'’.-]/u.test(v)) return 'Please use only letters in your name.';
  const lower = v.toLowerCase();
  if (hasKeyboardRun(lower) || isRepetitive(lower)) return 'That doesn’t look like a real name.';
  return undefined;
}

/** Only fires on obvious mash; anything a person actually wrote passes. */
export function validateNote(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (v.length > 2000) return 'Please keep this under 2000 characters.';
  if (v.length < 12) return undefined; // too short to judge fairly
  const lower = v.toLowerCase();
  if (hasKeyboardRun(lower) || isRepetitive(lower)) {
    return 'This looks like filler — tell us something real, or leave it blank.';
  }
  return undefined;
}

export interface LinkField {
  /** Canonical host, e.g. "github.com". Empty for a free-form portfolio URL. */
  host: string;
  /** Path prefix a bare handle is appended to, e.g. "in" for linkedin.com/in/x. */
  pathPrefix?: string;
  /** Shape a bare handle must match. */
  handle?: RegExp;
  label: string;
}

export const LINK_FIELDS: Record<'github' | 'linkedin' | 'portfolio', LinkField> = {
  // GitHub's own rule: alphanumeric with single internal hyphens, max 39 chars.
  github: {
    host: 'github.com',
    handle: /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/,
    label: 'GitHub',
  },
  linkedin: {
    host: 'linkedin.com',
    pathPrefix: 'in',
    handle: /^[\p{L}\p{N}][\p{L}\p{N}-]{1,98}$/u,
    label: 'LinkedIn',
  },
  portfolio: { host: '', label: 'Portfolio' },
};

/** A hostname that actually looks routable: label(s) plus a 2+ letter TLD. */
const HOSTNAME = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))*\.[a-z]{2,}$/i;

export interface LinkResult {
  url: string | null;
  error?: string;
}

/**
 * Normalises what people actually paste — "@me", "github.com/me", a bare
 * handle, a full URL — and rejects anything that isn't one of those.
 *
 * The version this replaces accepted literally any string: "asdfasdf" became
 * https://github.com/asdfasdf and sailed through.
 */
export function parseLink(raw: string, field: LinkField): LinkResult {
  const v = raw.trim().replace(/^@/, '');
  if (!v) return { url: null };
  // Only the outer whitespace is trimmed. Collapsing internal spaces would turn
  // "random junk here" into the plausible handle "randomjunkhere".
  if (/\s/.test(v)) return { url: null, error: `That isn’t a valid ${field.label} link.` };

  const looksLikeUrl = /^https?:\/\//i.test(v) || v.includes('/') || v.includes('.');

  if (!looksLikeUrl) {
    // Bare handle — only meaningful when the field has a canonical host.
    if (!field.host || !field.handle) {
      return { url: null, error: `Enter your ${field.label} address, like yoursite.com.` };
    }
    if (!field.handle.test(v)) {
      return { url: null, error: `That doesn’t look like a ${field.label} username.` };
    }
    return { url: `https://${field.host}/${[field.pathPrefix, v].filter(Boolean).join('/')}` };
  }

  let parsed: URL;
  try {
    parsed = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return { url: null, error: `That isn’t a valid ${field.label} link.` };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (!HOSTNAME.test(host)) {
    return { url: null, error: `That isn’t a valid ${field.label} link.` };
  }

  if (field.host) {
    // Match the domain or a subdomain of it — not a lookalike such as
    // "github.com.evil.tld" or "notgithub.com".
    if (host !== field.host && !host.endsWith(`.${field.host}`)) {
      return { url: null, error: `That should be a ${field.host} link.` };
    }
    if (!parsed.pathname.replace(/^\/+|\/+$/g, '')) {
      return { url: null, error: `Include your ${field.label} username in the link.` };
    }
  }

  return { url: parsed.toString() };
}
