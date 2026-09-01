-- The hiring desk: an internal, password-gated view of applications at /desk.
--
-- Two things happen here. First, the grants get tightened. Second, the pipeline
-- collapses from three tables into one `status` column.
--
-- WHY THE GRANTS CHANGE. Postgres grants anon/authenticated full DML on every
-- new table in `public` by default, so `applications`, `completed`, and
-- `selected` were all reachable by the public anon key — RLS was the only thing
-- standing between the internet and every applicant's email and phone. That
-- held, but it meant a single permissive policy added from the dashboard would
-- publish the lot. Now the grant is gone too, so a stray policy is no longer
-- enough on its own. The desk reads through the `hiring-desk` edge function
-- with the service-role key, which bypasses both.
--
-- The public form still works: it INSERTs with `Prefer: return=minimal`
-- (src/lib/supabase.ts), which needs no SELECT privilege.

-- ------------------------------------------------------------------
-- 1. Grants: applications is insert-only for the public, nothing else
--    is reachable at all.
-- ------------------------------------------------------------------
revoke all on public.applications from anon, authenticated;
grant insert on public.applications to anon, authenticated;

revoke all on public.completed from anon, authenticated;
revoke all on public.selected  from anon, authenticated;

-- ------------------------------------------------------------------
-- 2. One table, one status — instead of moving rows between tables
-- ------------------------------------------------------------------
-- Moving a row from `applications` to `completed` loses the original id, drops
-- the CHECK constraints (neither new table has any), and leaves "who applied"
-- split across two places that have to be UNIONed to answer any question. A
-- status column keeps one row per person for their whole lifecycle.
alter table public.applications
  add column if not exists status             text not null default 'new',
  add column if not exists remarks            text,
  add column if not exists status_updated_at  timestamptz;

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications
  add constraint applications_status_check
  check (status in ('new', 'shortlisted', 'completed', 'selected', 'rejected'));

alter table public.applications drop constraint if exists applications_remarks_check;
alter table public.applications
  add constraint applications_remarks_check
  check (remarks is null or length(remarks) <= 4000);

create index if not exists applications_status_idx
  on public.applications (status, created_at desc);

-- ------------------------------------------------------------------
-- 3. Fold the 8 existing `completed` rows in
-- ------------------------------------------------------------------
-- Verified before writing this: all 8 satisfy every CHECK on `applications`
-- except one row whose why_join is under the 20-char floor, and none of their
-- emails collide with a current application. created_at is carried over so the
-- July/August cohort keeps its real dates rather than today's.
--
-- `completed` is deliberately NOT dropped. It stays as an untouched backup of
-- what was there before this ran; nothing reads it after this migration.
insert into public.applications (
  created_at, full_name, email, phone, location,
  github_url, linkedin_url, portfolio_url, resume_path,
  domain, focus_areas, note, why_join,
  status, remarks, status_updated_at
)
select
  c.created_at, c.full_name, c.email, c.phone, c.location,
  c.github_url, c.linkedin_url, c.portfolio_url, c.resume_path,
  coalesce(c.domain, 'tech'), c.focus_areas, c.note,
  -- Null rather than padded: an answer too short to satisfy the constraint is
  -- not an answer to invent one for.
  case when length(c.why_join) between 20 and 2000 then c.why_join end,
  'completed', c.remarks, now()
from public.completed c
where not exists (
  select 1 from public.applications a where lower(a.email) = lower(c.email)
);

-- ------------------------------------------------------------------
-- 4. Desk auth — one password, hashed, living in the database
-- ------------------------------------------------------------------
-- The hash is PBKDF2-SHA256 and is only ever read by the edge function under
-- the service-role key. No policy is created on any table below, and the anon
-- grant is revoked, so the public key cannot see even the hash.
create table if not exists public.desk_auth (
  -- Single-row table: the CHECK makes `true` the only legal id.
  id             boolean primary key default true check (id),
  password_hash  text,
  salt           text,
  iterations     integer not null default 210000,
  -- The password is set from the UI on first visit, which means an unclaimed
  -- desk is claimable by whoever loads it first. This bounds that window
  -- instead of leaving it open forever; past the deadline the setup screen
  -- refuses, and reopening it is a deliberate one-liner:
  --   update public.desk_auth set setup_deadline = now() + interval '1 hour';
  setup_deadline timestamptz not null default now() + interval '24 hours',
  updated_at     timestamptz not null default now()
);
insert into public.desk_auth (id) values (true) on conflict (id) do nothing;

-- Sessions hold only a SHA-256 of the token, so a database leak doesn't hand
-- anyone a usable login.
create table if not exists public.desk_sessions (
  token_hash   text primary key,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  last_seen_at timestamptz not null default now()
);
create index if not exists desk_sessions_expires_idx on public.desk_sessions (expires_at);

-- Brute-force brake. One password guarded by nothing else is worth rate
-- limiting properly, and unlike api/chat.js's in-memory counter this survives
-- cold starts and is shared across every edge instance.
create table if not exists public.desk_login_attempts (
  ip            text primary key,
  fails         integer not null default 0,
  first_fail_at timestamptz not null default now(),
  locked_until  timestamptz
);

alter table public.desk_auth           enable row level security;
alter table public.desk_sessions       enable row level security;
alter table public.desk_login_attempts enable row level security;

-- No policies on purpose, and no grants either: unreachable with the anon key
-- by two independent mechanisms.
revoke all on public.desk_auth           from anon, authenticated;
revoke all on public.desk_sessions       from anon, authenticated;
revoke all on public.desk_login_attempts from anon, authenticated;
