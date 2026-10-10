-- Multi-screenshot proof submissions and social-share task support.
alter table public.tasks
  drop constraint if exists tasks_task_type_check;
alter table public.tasks
  add column if not exists share_message text,
  add column if not exists share_target integer not null default 1,
  add column if not exists requires_multiple_proofs boolean not null default false,
  add column if not exists min_proofs integer not null default 1,
  add column if not exists max_proofs integer not null default 10;
alter table public.tasks
  add constraint tasks_task_type_check check (task_type in ('one_time','repeated','ad','monetag_ad','timewall','social_share'));
alter table public.user_tasks
  add column if not exists proof_image_urls text[],
  add column if not exists share_count integer not null default 0,
  add column if not exists share_target integer not null default 1;
update public.tasks set min_proofs = greatest(coalesce(min_proofs, 1), 1), max_proofs = greatest(coalesce(max_proofs, 10), 1);
insert into storage.buckets (id, name, public) values ('task-proofs', 'task-proofs', true) on conflict (id) do update set public = excluded.public;
drop policy if exists "Public can view task proofs" on storage.objects;
create policy "Public can view task proofs" on storage.objects for select using (bucket_id = 'task-proofs');
drop policy if exists "Users can upload task proofs" on storage.objects;
create policy "Users can upload task proofs" on storage.objects for insert to authenticated with check (bucket_id = 'task-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create index if not exists user_tasks_proof_image_urls_gin on public.user_tasks using gin (proof_image_urls);
