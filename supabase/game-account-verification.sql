-- Game account verification fields for one-time/game task fraud prevention.
alter table public.tasks
  add column if not exists requires_game_id boolean not null default false,
  add column if not exists instructions text;

alter table public.user_tasks
  add column if not exists game_id text,
  add column if not exists account_name text,
  add column if not exists terms_accepted boolean not null default false;

create index if not exists user_tasks_game_id_idx on public.user_tasks (game_id);
