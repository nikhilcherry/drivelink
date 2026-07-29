-- The hiring form now requires a phone number and no longer requires a resume.
--
-- Verified before writing this migration: all 3 existing rows already have a
-- non-null phone of length >= 7 and a non-null resume_path, so neither change
-- needs a backfill.
alter table public.applications alter column phone set not null;

alter table public.applications drop constraint if exists applications_phone_check;
alter table public.applications
  add constraint applications_phone_check
  check (length(phone) between 7 and 40);

alter table public.applications alter column resume_path drop not null;
