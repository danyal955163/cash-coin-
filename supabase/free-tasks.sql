alter table public.tasks add column if not exists is_free_task boolean not null default false;
create index if not exists tasks_free_status_idx on public.tasks (is_free_task, status, created_at desc);
