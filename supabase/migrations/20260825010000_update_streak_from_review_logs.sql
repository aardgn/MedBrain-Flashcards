-- Review activity is recorded in UTC, while a study day follows Istanbul's
-- local calendar. Keep one stats row per authenticated user so the upsert is
-- atomic even when multiple reviews are submitted close together.
create unique index if not exists stats_user_id_key
  on public.stats (user_id);

create or replace function public.update_streak_from_review_log()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  study_day date := (new.created_at at time zone 'Europe/Istanbul')::date;
begin
  insert into public.stats as current_stats (
    username,
    user_id,
    streak,
    son_calisma
  )
  values (
    new.user_id::text,
    new.user_id,
    1,
    study_day::text
  )
  on conflict (user_id) do update
  set
    streak = case
      when current_stats.son_calisma = study_day::text
        then coalesce(current_stats.streak, 0)
      when current_stats.son_calisma = (study_day - 1)::text
        then coalesce(current_stats.streak, 0) + 1
      else 1
    end,
    son_calisma = study_day::text;

  return new;
end;
$$;

drop trigger if exists update_streak_after_review on public.review_logs;

create trigger update_streak_after_review
after insert on public.review_logs
for each row
execute function public.update_streak_from_review_log();

-- Repair stale stats rows from the review history that already exists.
with distinct_study_days as (
  select distinct
    user_id,
    (created_at at time zone 'Europe/Istanbul')::date as study_day
  from public.review_logs
),
ranked_study_days as (
  select
    user_id,
    study_day,
    max(study_day) over (partition by user_id) as last_study_day,
    row_number() over (partition by user_id order by study_day desc) as day_number
  from distinct_study_days
),
current_streaks as (
  select
    user_id,
    max(last_study_day) as last_study_day,
    count(*)::integer as streak
  from ranked_study_days
  where study_day + ((day_number - 1)::integer) = last_study_day
  group by user_id
)
insert into public.stats as current_stats (
  username,
  user_id,
  streak,
  son_calisma
)
select
  user_id::text,
  user_id,
  streak,
  last_study_day::text
from current_streaks
on conflict (user_id) do update
set
  streak = excluded.streak,
  son_calisma = excluded.son_calisma;
