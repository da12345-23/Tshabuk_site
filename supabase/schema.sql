-- Run this once in the Supabase SQL editor for the Tashabuk project.

create table if not exists leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  time_ms integer not null,
  locale text not null default 'ar',
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_time_ms_idx on leaderboard (time_ms asc);

alter table leaderboard enable row level security;

-- Anyone can read the leaderboard.
create policy "leaderboard_select_all"
  on leaderboard for select
  using (true);

-- Anyone can insert their own finished-puzzle score.
create policy "leaderboard_insert_all"
  on leaderboard for insert
  with check (
    char_length(name) between 1 and 60
    and time_ms between 0 and 3600000
  );
