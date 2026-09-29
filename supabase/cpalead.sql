-- Run once in Supabase SQL Editor before enabling the CPALead postback.
create table if not exists public.cpalead_conversions (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null unique,
  username text not null,
  payout_usd numeric(12,6) not null,
  coins integer not null,
  campaign_id text,
  campaign_name text,
  ip_address text,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.credit_cpalead_coins(
  p_subid text,
  p_payout numeric,
  p_coins integer,
  p_lead_id text,
  p_campaign_id text,
  p_campaign_name text,
  p_ip text,
  p_raw jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_inserted integer;
begin
  select id into v_user_id from public.profiles where username = p_subid limit 1;
  if v_user_id is null then
    return jsonb_build_object('success', false, 'status', 'user_not_found');
  end if;

  insert into public.cpalead_conversions (lead_id, username, payout_usd, coins, campaign_id, campaign_name, ip_address, raw_data)
  values (p_lead_id, p_subid, p_payout, greatest(p_coins, 0), p_campaign_id, p_campaign_name, p_ip, p_raw)
  on conflict (lead_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return jsonb_build_object('success', true, 'status', 'duplicate', 'lead_id', p_lead_id);
  end if;

  update public.profiles
  set coins = coalesce(coins, 0) + greatest(p_coins, 0),
      withdrawal_wallet = coalesce(withdrawal_wallet, 0) + (greatest(p_coins, 0) / 100.0)
  where id = v_user_id;

  insert into public.earnings_log (user_id, source, description, coins, pkr_value)
  values (v_user_id, 'cpalead', coalesce(nullif(p_campaign_name, ''), 'CPALead offer'), greatest(p_coins, 0), p_payout);

  return jsonb_build_object('success', true, 'status', 'credited', 'coins', greatest(p_coins, 0), 'lead_id', p_lead_id);
end;
$$;

grant execute on function public.credit_cpalead_coins(text, numeric, integer, text, text, text, text, jsonb) to service_role;
