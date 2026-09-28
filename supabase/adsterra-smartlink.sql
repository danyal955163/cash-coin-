-- Run this migration in the Supabase SQL Editor before enabling Adsterra ad tasks.

alter table public.tasks
  add column if not exists ad_url text,
  add column if not exists ad_daily_limit integer not null default 20,
  add column if not exists ad_duration_seconds integer not null default 15,
  add column if not exists cooldown_seconds integer not null default 10;

create or replace function public.claim_ad_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_task public.tasks%rowtype;
  v_completed integer;
  v_limit integer;
  v_coins integer;
  v_cooldown integer;
  v_last_completed timestamptz;
begin
  if v_user_id is null then
    raise exception 'You must be logged in.';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id and status = 'active' and task_type = 'ad'
  for update;

  if not found then
    raise exception 'Ad task is not available.';
  end if;

  v_limit := greatest(coalesce(v_task.ad_daily_limit, 20), 1);
  v_cooldown := greatest(coalesce(v_task.cooldown_seconds, 10), 5);
  select completed_at into v_last_completed
  from public.user_tasks
  where user_id = v_user_id and task_id = p_task_id and status = 'approved'
  order by completed_at desc nulls last
  limit 1;
  if v_last_completed is not null and v_last_completed + make_interval(secs => v_cooldown) > now() then
    raise exception 'Please wait % seconds before claiming this ad again.',
      ceil(extract(epoch from (v_last_completed + make_interval(secs => v_cooldown) - now())));
  end if;
  select count(*) into v_completed
  from public.user_tasks
  where user_id = v_user_id
    and task_id = p_task_id
    and status = 'approved'
    and created_at >= date_trunc('day', now());

  if v_completed >= v_limit then
    raise exception 'Daily limit reached for this ad.';
  end if;

  v_coins := greatest(coalesce(v_task.coins_reward, 0), 0);
  insert into public.user_tasks (user_id, task_id, proof_image_url, coins_earned, status, completed_at)
  values (v_user_id, p_task_id, null, v_coins, 'approved', now());

  update public.profiles
  set coins = coalesce(coins, 0) + v_coins,
      withdrawal_wallet = coalesce(withdrawal_wallet, 0) + (v_coins / 100.0)
  where id = v_user_id;

  return jsonb_build_object('success', true, 'coins', v_coins, 'coins_earned', v_coins, 'cooldown_seconds', v_cooldown);
end;
$$;

grant execute on function public.claim_ad_task(uuid) to authenticated;
