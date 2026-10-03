-- CashCoin broadcast and atomic AI review safety migration
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  image_url text,
  link_url text,
  link_text text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists broadcasts_active_created_idx on public.broadcasts (is_active, created_at desc);
alter table public.broadcasts enable row level security;
drop policy if exists "broadcasts_read_active" on public.broadcasts;
create policy "broadcasts_read_active" on public.broadcasts for select to authenticated using (is_active = true or public.is_admin());
drop policy if exists "broadcasts_admin_insert" on public.broadcasts;
create policy "broadcasts_admin_insert" on public.broadcasts for insert to authenticated with check (public.is_admin());
drop policy if exists "broadcasts_admin_update" on public.broadcasts;
create policy "broadcasts_admin_update" on public.broadcasts for update to authenticated using (public.is_admin()) with check (public.is_admin());
insert into storage.buckets (id, name, public) values ('broadcasts', 'broadcasts', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('task-references', 'task-references', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('support-attachments', 'support-attachments', true) on conflict (id) do nothing;
drop policy if exists "broadcasts_public_read" on storage.objects;
create policy "broadcasts_public_read" on storage.objects for select using (bucket_id = 'broadcasts');
drop policy if exists "broadcasts_admin_upload" on storage.objects;
create policy "broadcasts_admin_upload" on storage.objects for insert to authenticated with check (bucket_id = 'broadcasts' and public.is_admin());
create table if not exists public.ai_review_log (
  id uuid primary key default gen_random_uuid(), user_task_id uuid not null unique references public.user_tasks(id) on delete cascade, task_id uuid references public.tasks(id) on delete set null, user_id uuid references auth.users(id) on delete set null, ai_score integer, ai_decision text, ai_reason text, created_at timestamptz not null default now()
);
create or replace function public.approve_single_user_task(p_user_task_id uuid, p_ai_score integer, p_ai_reason text) returns jsonb language plpgsql security definer set search_path = public as $$
declare ut public.user_tasks; t public.tasks; pkr_value numeric;
begin
  select * into ut from public.user_tasks where id = p_user_task_id and status = 'pending' for update;
  if ut.id is null then return jsonb_build_object('success', false, 'reason', 'Already processed'); end if;
  select * into t from public.tasks where id = ut.task_id;
  if t.id is null then return jsonb_build_object('success', false, 'reason', 'Task not found'); end if;
  update public.user_tasks set status='approved', coins_earned=t.coins_reward, ai_score=p_ai_score, ai_reason=p_ai_reason, ai_decision='approve', completed_at=now() where id=p_user_task_id and status='pending';
  if not found then return jsonb_build_object('success', false, 'reason', 'Race condition'); end if;
  pkr_value := t.coins_reward::numeric / 100;
  update public.profiles set coins=coalesce(coins,0)+t.coins_reward, withdrawal_wallet=coalesce(withdrawal_wallet,0)+pkr_value, total_earnings=coalesce(total_earnings,0)+pkr_value where id=ut.user_id;
  insert into public.earnings_log(user_id, source, description, coins, pkr_value) values(ut.user_id,'task','Task: '||t.title,t.coins_reward,pkr_value);
  insert into public.notifications(user_id,title,message,type,link) values(ut.user_id,'✅ Task Approved!',t.title||' - You earned '||t.coins_reward||' coins!','success','/wallet');
  return jsonb_build_object('success',true,'coins',t.coins_reward);
end; $$;
grant execute on function public.approve_single_user_task(uuid, integer, text) to authenticated;
