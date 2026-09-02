/**
 * hiring-desk — the server side of /desk.
 *
 * WHY THIS EXISTS AT ALL. The site is a static export, so every key it ships is
 * public (src/lib/supabase.ts says as much). A password checked in the browser
 * against a row the browser can read is not a lock — anyone can read the row,
 * and anyone can skip the check and call PostgREST directly. So the check runs
 * here instead, where the service-role key lives and the client cannot reach.
 *
 * Supabase injects SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY into every edge
 * function automatically. There is no secret to copy anywhere, which is the
 * whole reason this is an edge function and not a Vercel route next to
 * api/chat.js.
 *
 * Deploy with verify_jwt disabled: callers are anonymous browsers holding a
 * desk token, not Supabase-authenticated users.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SESSION_HOURS = 12;
const MIN_PASSWORD = 10;
const MAX_FAILS = 8;
const LOCK_MINUTES = 15;
const RESUME_URL_SECONDS = 3600;

const ALLOWED_ORIGINS = [
  "https://www.drivelink.tech",
  "https://drivelink.tech",
  "http://localhost:3000",
  "http://localhost:3001",
];

const STATUSES = ["new", "shortlisted", "completed", "selected", "rejected"];

function corsHeaders(origin: string | null): Record<string, string> {
  // Echo only an allowlisted origin. A wildcard here would let any site on the
  // internet drive the desk with a token stolen from a user's tab.
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

// ---------------------------------------------------------------- db helpers

async function db(path: string, init: RequestInit = {}): Promise<Response> {
  return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

async function dbJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await db(path, init);
  if (!res.ok) throw new Error(`db ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

// ------------------------------------------------------------------- crypto

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function pbkdf2(password: string, salt: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations, hash: "SHA-256" },
    key,
    256,
  );
  return hex(bits);
}

async function sha256(value: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

/** Comparison whose duration doesn't leak how much of the hash matched. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)).buffer);

/**
 * `applications.id` is a uuid, and every handler below interpolates it into a
 * PostgREST query string. Without this gate an id of
 * "0&or=(id.not.is.null)" turns `applications?id=eq.0` into a filter that
 * matches every row — so "delete one application" becomes "delete all of
 * them" for anyone holding a desk session. Anchored, so nothing rides along
 * after a valid uuid either.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

// -------------------------------------------------------------------- types

interface DeskAuth {
  password_hash: string | null;
  salt: string | null;
  iterations: number;
  setup_deadline: string;
}

interface Attempt {
  ip: string;
  fails: number;
  first_fail_at: string;
  locked_until: string | null;
}

async function readAuth(): Promise<DeskAuth> {
  const rows = await dbJson<DeskAuth[]>(
    "desk_auth?id=eq.true&select=password_hash,salt,iterations,setup_deadline",
  );
  if (!rows.length) throw new Error("desk_auth row missing — run migration 0005");
  return rows[0];
}

/** Resolves the bearer token to a live session, or null. Also extends it. */
async function validSession(token: unknown): Promise<boolean> {
  if (typeof token !== "string" || token.length !== 64) return false;
  const tokenHash = await sha256(token);
  const rows = await dbJson<{ token_hash: string }[]>(
    `desk_sessions?token_hash=eq.${tokenHash}&expires_at=gt.${new Date().toISOString()}&select=token_hash`,
  );
  if (!rows.length) return false;
  // Sliding expiry: an afternoon of reviewing shouldn't log you out mid-note.
  await db(`desk_sessions?token_hash=eq.${tokenHash}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      last_seen_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString(),
    }),
  });
  return true;
}

async function issueSession(): Promise<{ token: string; expires_at: string }> {
  const token = randomToken();
  const expires_at = new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString();
  await db("desk_sessions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ token_hash: await sha256(token), expires_at }),
  });
  // Opportunistic sweep — no cron needed for a table this small.
  await db(`desk_sessions?expires_at=lt.${new Date().toISOString()}`, { method: "DELETE" });
  return { token, expires_at };
}

// ------------------------------------------------------------- rate limiting

async function checkLock(ip: string): Promise<number> {
  const rows = await dbJson<Attempt[]>(`desk_login_attempts?ip=eq.${encodeURIComponent(ip)}&select=*`);
  const row = rows[0];
  if (!row?.locked_until) return 0;
  const ms = new Date(row.locked_until).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 1000) : 0;
}

async function recordFail(ip: string): Promise<void> {
  const rows = await dbJson<Attempt[]>(`desk_login_attempts?ip=eq.${encodeURIComponent(ip)}&select=*`);
  const row = rows[0];
  const now = Date.now();
  // A stale streak shouldn't count against you forever.
  const windowOpen = row && now - new Date(row.first_fail_at).getTime() < LOCK_MINUTES * 60_000;
  const fails = windowOpen ? row.fails + 1 : 1;
  const body = {
    ip,
    fails,
    first_fail_at: windowOpen ? row.first_fail_at : new Date().toISOString(),
    locked_until: fails >= MAX_FAILS ? new Date(now + LOCK_MINUTES * 60_000).toISOString() : null,
  };
  await db("desk_login_attempts", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
}

const clearFails = (ip: string) =>
  db(`desk_login_attempts?ip=eq.${encodeURIComponent(ip)}`, { method: "DELETE" });

// ------------------------------------------------------------------ handler

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "POST only" }, 405, origin);

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request." }, 400, origin);
  }
  const action = String(body.action ?? "");

  try {
    // ---- unauthenticated: what screen should the page show? ----
    if (action === "status") {
      const auth = await readAuth();
      return json({
        needs_setup: !auth.password_hash,
        setup_open: !auth.password_hash && new Date(auth.setup_deadline) > new Date(),
        setup_deadline: auth.setup_deadline,
      }, 200, origin);
    }

    // ---- claim the desk (first visit only) ----
    if (action === "setup") {
      const auth = await readAuth();
      if (auth.password_hash) return json({ error: "A password is already set." }, 409, origin);
      if (new Date(auth.setup_deadline) <= new Date()) {
        return json({ error: "The setup window has closed. Reopen it from the Supabase SQL editor." }, 403, origin);
      }
      const password = String(body.password ?? "");
      if (password.length < MIN_PASSWORD) {
        return json({ error: `Use at least ${MIN_PASSWORD} characters.` }, 400, origin);
      }
      const salt = randomToken();
      const password_hash = await pbkdf2(password, salt, auth.iterations);
      await db("desk_auth?id=eq.true", {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ password_hash, salt, updated_at: new Date().toISOString() }),
      });
      return json(await issueSession(), 200, origin);
    }

    // ---- login ----
    if (action === "login") {
      const lockedFor = await checkLock(ip);
      if (lockedFor > 0) {
        return json({ error: `Too many attempts. Try again in ${Math.ceil(lockedFor / 60)} min.` }, 429, origin);
      }
      const auth = await readAuth();
      if (!auth.password_hash || !auth.salt) {
        return json({ error: "No password is set yet." }, 409, origin);
      }
      const candidate = await pbkdf2(String(body.password ?? ""), auth.salt, auth.iterations);
      if (!timingSafeEqual(candidate, auth.password_hash)) {
        await recordFail(ip);
        return json({ error: "Wrong password." }, 401, origin);
      }
      await clearFails(ip);
      return json(await issueSession(), 200, origin);
    }

    // ---- everything past here needs a live session ----
    if (!(await validSession(body.token))) {
      return json({ error: "Session expired. Sign in again." }, 401, origin);
    }

    if (action === "list") {
      const rows = await dbJson<unknown[]>(
        "applications?select=id,created_at,full_name,email,phone,location,github_url," +
          "linkedin_url,portfolio_url,resume_path,domain,focus_areas,note,why_join," +
          "status,remarks,status_updated_at&order=created_at.desc",
      );
      return json({ applications: rows }, 200, origin);
    }

    if (action === "update") {
      const id = body.id;
      if (!isUuid(id)) return json({ error: "Missing or malformed id." }, 400, origin);
      const patch: Record<string, unknown> = {};
      if (body.status !== undefined) {
        const status = String(body.status);
        if (!STATUSES.includes(status)) return json({ error: "Unknown status." }, 400, origin);
        patch.status = status;
        patch.status_updated_at = new Date().toISOString();
      }
      if (body.remarks !== undefined) {
        const remarks = String(body.remarks ?? "").trim();
        if (remarks.length > 4000) return json({ error: "Notes are too long." }, 400, origin);
        patch.remarks = remarks || null;
      }
      if (!Object.keys(patch).length) return json({ error: "Nothing to update." }, 400, origin);
      const res = await db(`applications?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return json({ error: `Update failed (${res.status}).` }, 400, origin);
      const rows = await res.json();
      return json({ application: rows[0] ?? null }, 200, origin);
    }

    if (action === "delete") {
      const id = body.id;
      if (!isUuid(id)) return json({ error: "Missing or malformed id." }, 400, origin);
      const res = await db(`applications?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
      if (!res.ok) return json({ error: `Delete failed (${res.status}).` }, 400, origin);
      return json({ ok: true }, 200, origin);
    }

    // ---- one-hour signed link to a resume in the private bucket ----
    if (action === "resume_url") {
      const id = body.id;
      if (!isUuid(id)) return json({ error: "Missing or malformed id." }, 400, origin);
      const rows = await dbJson<{ resume_path: string | null }[]>(
        `applications?id=eq.${id}&select=resume_path`,
      );
      const path = rows[0]?.resume_path;
      if (!path) return json({ error: "No resume on this application." }, 404, origin);
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/resumes/${path}`, {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: RESUME_URL_SECONDS }),
      });
      if (!res.ok) return json({ error: `Could not sign the resume link (${res.status}).` }, 400, origin);
      const { signedURL } = await res.json();
      // download= sets Content-Disposition: attachment. Resumes arrive from
      // strangers with a Content-Type of their choosing, and an inline link to
      // stored HTML or SVG is a page the team has been invited to trust.
      const filename = path.split("/").pop() || "resume";
      const url = `${SUPABASE_URL}/storage/v1${signedURL}` +
        `${signedURL.includes("?") ? "&" : "?"}download=${encodeURIComponent(filename)}`;
      return json({ url }, 200, origin);
    }

    if (action === "change_password") {
      const auth = await readAuth();
      const current = await pbkdf2(String(body.current ?? ""), auth.salt!, auth.iterations);
      if (!timingSafeEqual(current, auth.password_hash!)) {
        return json({ error: "Current password is wrong." }, 401, origin);
      }
      const next = String(body.next ?? "");
      if (next.length < MIN_PASSWORD) {
        return json({ error: `Use at least ${MIN_PASSWORD} characters.` }, 400, origin);
      }
      const salt = randomToken();
      await db("desk_auth?id=eq.true", {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          salt,
          password_hash: await pbkdf2(next, salt, auth.iterations),
          updated_at: new Date().toISOString(),
        }),
      });
      // Changing the password ends every other session — the point of changing
      // it is usually that someone shouldn't still be in.
      await db("desk_sessions?token_hash=neq.__none__", { method: "DELETE" });
      return json(await issueSession(), 200, origin);
    }

    if (action === "logout") {
      await db(`desk_sessions?token_hash=eq.${await sha256(String(body.token))}`, { method: "DELETE" });
      return json({ ok: true }, 200, origin);
    }

    return json({ error: "Unknown action." }, 400, origin);
  } catch (err) {
    // Log the detail, return a generic message: the error text can carry table
    // and column names, which the browser has no business seeing.
    console.error("[hiring-desk]", action, err);
    return json({ error: "Something went wrong on our side." }, 500, origin);
  }
});
