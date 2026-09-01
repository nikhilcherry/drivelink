-- Tech domain opens up: App Development, Web Development, Robotics/ROS join the
-- existing ML / IoT / R&D focus areas, and the form now asks the one question
-- we actually read first — "why do you want to join DriveLink?".
--
-- MUST be applied before the new form ships. Until it is, the old
-- `focus_areas <@ array['ml','iot','rnd']` CHECK rejects any application that
-- picks appdev/webdev/ros with a 400, which the form surfaces to the candidate
-- as a generic "something went wrong".

-- Existing ids are unchanged, so no row needs rewriting. The upper bound moves
-- 3 -> 6 because there are now six areas and picking all of them is legitimate.
alter table public.applications drop constraint if exists applications_focus_areas_check;
alter table public.applications
  add constraint applications_focus_areas_check
  check (
    coalesce(array_length(focus_areas, 1), 0) between 1 and 6
    and focus_areas <@ array['appdev', 'webdev', 'ml', 'ros', 'iot', 'rnd']
  );

-- Nullable on purpose: required in the form, but the rows captured before this
-- question existed have no answer and must not be invented or blocked.
alter table public.applications
  add column if not exists why_join text;

alter table public.applications drop constraint if exists applications_why_join_check;
alter table public.applications
  add constraint applications_why_join_check
  check (why_join is null or length(why_join) between 20 and 2000);
