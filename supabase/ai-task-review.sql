-- AI-powered task proof review support. Run this migration in the Supabase SQL Editor.

alter table public.tasks
  add column if not exists ai_review_enabled boolean not null default false,
  add column if not exists reference_image_url text,
  add column if not exists ai_instructions text;

alter table public.user_tasks
  add column if not exists ai_score integer,
  add column if not exists ai_reason text,
  add column if not exists ai_decision text check (ai_decision in ('approve', 'reject', 'manual'));

insert into storage.buckets (id, name, public)
values ('task-references', 'task-references', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view task references" on storage.objects;
create policy "Public can view task references" on storage.objects for select using (bucket_id = 'task-references');
drop policy if exists "Admins can upload task references" on storage.objects;
create policy "Admins can upload task references" on storage.objects for insert to authenticated with check (bucket_id = 'task-references' and public.is_admin());

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.credit_task_coins(
  p_user_id uuid,
  p_coins integer,
  p_task_title text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pkr numeric;
begin
  pkr := p_coins::numeric / 100;
  update public.profiles
  set coins = coalesce(coins, 0) + p_coins,
      withdrawal_wallet = coalesce(withdrawal_wallet, 0) + pkr,
      total_earnings = coalesce(total_earnings, 0) + pkr
  where id = p_user_id;
  insert into public.earnings_log (user_id, source, description, coins, pkr_value)
  values (p_user_id, 'task', 'Task: ' || p_task_title, p_coins, pkr);
  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.credit_task_coins(uuid, integer, text) to authenticated, anon;

-- The existing task-proofs bucket is reused for user submissions.
