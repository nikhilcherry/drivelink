-- DriveLink hiring — applications table + private resume bucket.
--
-- ALREADY APPLIED to project ref `luindvflrxpsaxpdqidx` (migration name:
-- hiring_applications). Kept here as the source of truth and so it can be
-- replayed onto a fresh project — every statement is idempotent.
--
-- The site is a static export, so the browser talks to Supabase directly with
-- the public anon/publishable key. RLS is therefore the ENTIRE security
-- boundary: anyone may INSERT an application, nobody may read one back
-- without the service-role key.
--
-- Verify with the anon key alone after any change:
--   GET  /rest/v1/applications                     -> [] or 401, never rows
--   GET  /storage/v1/object/public/resumes/<path>  -> 400/404, never the file
-- If either returns data, the policies below did not apply — stop and fix.

-- ------------------------------------------------------------------
-- Table
-- ------------------------------------------------------------------
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  full_name     text not null check (length(full_name) between 2 and 120),
  email         text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone         text check (phone is null or length(phone) <= 40),
  -- Nullable: the form stopped asking for location (see 0002). Kept so the
  -- rows captured while it was collected keep their value.
  location      text check (location is null or length(location) between 2 and 120),

  -- All three shown on the form, all optional.
  github_url    text check (github_url    is null or length(github_url)    <= 300),
  linkedin_url  text check (linkedin_url  is null or length(linkedin_url)  <= 300),
  portfolio_url text check (portfolio_url is null or length(portfolio_url) <= 300),

  resume_path   text not null,

  -- One domain today; text (not an enum) so adding 'design' or 'business'
  -- later is a one-line constraint change, not a type migration.
  domain        text not null default 'tech' check (domain in ('tech')),

  -- coalesce is load-bearing: array_length('{}', 1) is NULL, not 0, and a CHECK
  -- only fails on FALSE — so without it an empty focus_areas array slips
  -- through. Verified against the live endpoint; do not "simplify" it away.
  focus_areas   text[] not null check (
    coalesce(array_length(focus_areas, 1), 0) between 1 and 3
    and focus_areas <@ array['ml', 'iot', 'rnd']
  ),

  note          text check (note is null or length(note) <= 2000)
);

-- The browser is untrusted, so the CHECK constraints above are the real
-- validation; the client-side checks only exist to give a nicer error.

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

alter table public.applications enable row level security;

-- ------------------------------------------------------------------
-- Table policies — INSERT only. No SELECT/UPDATE/DELETE policy exists,
-- so with RLS on, those are denied for anon and authenticated alike.
-- ------------------------------------------------------------------
drop policy if exists "anyone can submit an application" on public.applications;
create policy "anyone can submit an application"
  on public.applications
  for insert
  to anon, authenticated
  with check (true);

-- ------------------------------------------------------------------
-- Storage — private bucket, write-only for the public
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,                      -- private: no public URL serves these files
  5242880,                    -- 5 MB, matching MAX_RESUME_BYTES in src/lib/supabase.ts
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone can upload a resume" on storage.objects;
create policy "anyone can upload a resume"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'resumes');

-- Intentionally NO select/update/delete policy on storage.objects for this
-- bucket. Resumes are readable only from the dashboard, the service-role key,
-- or a signed URL — never by guessing a path.

-- ------------------------------------------------------------------
-- Reading applications (for the team)
-- ------------------------------------------------------------------
-- Use the SQL editor or a service-role key, e.g.:
--   select created_at, full_name, email, location, focus_areas, resume_path
--     from public.applications
--    order by created_at desc;
-- Then Storage -> resumes -> "Get signed URL" on the resume_path to download.
