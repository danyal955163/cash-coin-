-- Run in the Supabase SQL Editor before creating Monetag Ad tasks.
-- Monetag Ad uses the same timer/client flow and claim RPC as Adsterra ads.

alter table public.tasks drop constraint if exists tasks_task_type_check;

create or replace function public.claim_ad_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_task public.tasks%rowtype;
  v_package_limit integer;
  v_today_count integer;
  v_task_today_count integer;
  v_last_completed timestamptz;
  v_limit integer;
  v_cooldown integer;
  v_coins integer;
  v_pkr numeric;
  v_seconds_since integer;
begin
  if v_user_id is null then raise exception 'You must be logged in.'; end if;

  select * into v_task
  from public.tasks
  where id = p_task_id and status = 'active'
  for update;
  if not found then raise exception 'Ad task is not available.'; end if;
  if v_task.task_type not in ('ad', 'monetag_ad') then raise exception 'Not an ad task'; end if;

  select coalesce(ps.daily_tasks, 1) into v_package_limit
  from public.profiles p
  left join public.packages_settings ps on ps.name = coalesce(p.package_name, 'Free')
  where p.id = v_user_id;
  v_package_limit := greatest(coalesce(v_package_limit, 1), 1);

  select count(*) into v_today_count
  from public.user_tasks
  where user_id = v_user_id
    and created_at >= date_trunc('day', now())
    and status in ('pending', 'approved');
  if v_today_count >= v_package_limit then raise exception 'Daily task limit reached'; end if;

  v_limit := greatest(coalesce(v_task.ad_daily_limit, 20), 1);
  select count(*) into v_task_today_count
  from public.user_tasks
  where user_id = v_user_id and task_id = p_task_id
    and created_at >= date_trunc('day', now());
  if v_task_today_count >= v_limit then raise exception 'Daily ad limit for this task reached'; end if;

  v_cooldown := greatest(coalesce(v_task.cooldown_seconds, 10), 1);
  select completed_at into v_last_completed
  from public.user_tasks
  where user_id = v_user_id and task_id = p_task_id and status = 'approved'
  order by completed_at desc nulls last limit 1;
  if v_last_completed is not null then
    v_seconds_since := extract(epoch from (now() - v_last_completed))::integer;
    if v_seconds_since < v_cooldown then
      raise exception 'Please wait % seconds before claiming this ad again.', v_cooldown - v_seconds_since;
    end if;
  end if;

  v_coins := greatest(coalesce(v_task.coins_reward, 0), 0);
  v_pkr := v_coins / 100.0;
  insert into public.user_tasks (user_id, task_id, proof_image_url, coins_earned, status, completed_at)
  values (v_user_id, p_task_id, null, v_coins, 'approved', now());

  update public.profiles
  set coins = coalesce(coins, 0) + v_coins,
      withdrawal_wallet = coalesce(withdrawal_wallet, 0) + v_pkr,
      total_earnings = coalesce(total_earnings, 0) + v_pkr
  where id = v_user_id;

  insert into public.earnings_log (user_id, source, description, coins, pkr_value)
  values (v_user_id, 'ad', case when v_task.task_type = 'monetag_ad' then 'Monetag ad: ' else 'Adsterra ad: ' end || v_task.title, v_coins, v_pkr);

  return jsonb_build_object('success', true, 'coins', v_coins, 'coins_earned', v_coins, 'cooldown_seconds', v_cooldown);
end;
$$;

grant execute on function public.claim_ad_task(uuid) to authenticated;
