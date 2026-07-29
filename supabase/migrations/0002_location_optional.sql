-- The hiring form stopped asking applicants for their location.
--
-- ALREADY APPLIED to project ref `luindvflrxpsaxpdqidx` (migration name:
-- hiring_location_optional).
--
-- The column is kept rather than dropped so rows captured while the field
-- existed keep their value; it just can't be required any more.
alter table public.applications alter column location drop not null;

alter table public.applications drop constraint if exists applications_location_check;
alter table public.applications
  add constraint applications_location_check
  check (location is null or length(location) between 2 and 120);
