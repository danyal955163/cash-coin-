-- Run this migration in the Supabase SQL Editor.

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  user_email text,
  subject text not null,
  message text not null,
  screenshot_url text,
  status text default 'open',
  created_at timestamp default now()
);

alter table public.support_tickets enable row level security;
drop policy if exists "support_all" on public.support_tickets;
create policy "support_all" on public.support_tickets for all using (true) with check (true);

drop function if exists public.approve_user_tasks(uuid[]) cascade;
create or replace function public.approve_user_tasks(p_task_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ut public.user_tasks;
  total_coins integer := 0;
  t public.tasks;
begin
  if not public.is_admin() then raise exception 'Admin required'; end if;

  for ut in select * from public.user_tasks where id = any(p_task_ids) and status = 'pending' loop
    select * into t from public.tasks where id = ut.task_id;
    if t.id is not null then
      update public.user_tasks set status = 'approved', coins_earned = t.coins_reward where id = ut.id;
      update public.profiles
        set coins = coalesce(coins, 0) + t.coins_reward,
            total_earnings = coalesce(total_earnings, 0) + (t.coins_reward::numeric / 100)
        where id = ut.user_id;
      total_coins := total_coins + t.coins_reward;
    end if;
  end loop;

  return jsonb_build_object('success', true, 'total_coins', total_coins);
end;
$$;

grant execute on function public.approve_user_tasks(uuid[]) to authenticated;
