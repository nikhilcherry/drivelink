/**
 * Minimal Supabase client for the hiring form.
 *
 * The site is a static export (next.config.js: output: 'export'), so there are
 * no Next.js API routes to proxy through — the browser talks to Supabase
 * directly. That is the standard Supabase model: the anon key is *meant* to be
 * public, and row-level security is what actually protects the data. See
 * supabase/migrations/0001_hiring.sql — `applications` has an INSERT policy and
 * no SELECT policy, and the `resumes` bucket is private with no read policy.
 *
 * Deliberately no @supabase/supabase-js dependency: the REST and Storage
 * endpoints are plain HTTP, the same way api/chat.js calls Groq with bare fetch.
 */

const DEFAULT_SUPABASE_URL = 'https://luindvflrxpsaxpdqidx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7uLL2hmIYdFN6YYtfYsFYw_UMae5oEk';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

/** False until both env vars are set, so the form can say so instead of failing silently. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Server side of /desk — see supabase/functions/hiring-desk/index.ts.
 *
 * The desk goes through an edge function rather than PostgREST because the anon
 * key above is public: migration 0005 revoked its read access to
 * `applications`, so applicant data is only reachable behind the password the
 * function checks with the service-role key.
 */
export const DESK_ENDPOINT = `${SUPABASE_URL}/functions/v1/hiring-desk`;

export const RESUME_BUCKET = 'resumes';
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'] as const;

/**
 * Stored verbatim in `applications.focus_areas`, so these string ids are a
 * data contract, not labels — renaming one orphans every row that used it.
 * Change the display text in ApplicationForm's FOCUS_AREAS instead.
 */
export type FocusArea = 'appdev' | 'webdev' | 'ml' | 'ros' | 'iot' | 'rnd';

export interface ApplicationRow {
  full_name: string;
  email: string;
  phone: string;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_path: string | null;
  domain: 'tech';
  focus_areas: FocusArea[];
  why_join: string;
  note: string | null;
}

function authHeaders(): Record<string, string> {
  return { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
}

/**
 * Strip anything that would make a storage key ambiguous — path separators,
 * traversal dots, and non-ASCII — while keeping the name recognisable.
 */
function sanitizeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._]+/, '')
    .slice(-80);
  return cleaned || 'resume';
}

export function resumeExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

/**
 * Uploads the resume and returns its storage path.
 *
 * A random UUID prefixes every path so two applicants named the same file can't
 * collide, and so no one can guess another applicant's key from their own.
 */
export async function uploadResume(file: File): Promise<string> {
  const path = `applications/${crypto.randomUUID()}/${sanitizeFilename(file.name)}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${RESUME_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Resume upload failed (${res.status})`);
  }
  return path;
}

/**
 * Inserts the application row.
 *
 * Called *after* uploadResume so the row always points at a file that exists.
 * If this insert then fails the uploaded file is orphaned in storage — the
 * better of the two failure modes, and cheap to sweep later if it ever matters.
 */
export async function insertApplication(row: ApplicationRow): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    throw new Error(`Application submit failed (${res.status})`);
  }
}
