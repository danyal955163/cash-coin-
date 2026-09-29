-- Run once to align the current balance with the canonical withdrawal wallet.
update public.profiles
set withdrawal_wallet = coalesce(total_earnings, 0)
where coalesce(withdrawal_wallet, 0) <> coalesce(total_earnings, 0);

-- Approving a deposit activates the package; it must not credit deposit_wallet,
-- coins, or withdrawal_wallet.
create or replace function public.approve_deposit(p_deposit_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.deposits;
  duration integer;
  pkg_price numeric;
  amount_credit numeric(12,2);
begin
  if not public.is_admin() then raise exception 'Admin required'; end if;
  select * into d from public.deposits where id = p_deposit_id for update;
  if not found then raise exception 'Deposit not found'; end if;
  if d.status = 'approved' then
    return jsonb_build_object('success', true, 'already_approved', true);
  end if;
  amount_credit := coalesce(d.amount_sent, d.amount_pkr, d.amount, 0);
  if amount_credit <= 0 then raise exception 'Invalid amount'; end if;
  update public.deposits set status = 'approved' where id = p_deposit_id;
  select duration_days, price into duration, pkg_price
  from public.packages_settings where name = d.package_name limit 1;
  update public.profiles
  set total_deposits = coalesce(total_deposits, 0) + amount_credit,
      package_name = coalesce(d.package_name, package_name),
      package_expires_at = case
        when coalesce(d.package_name, '') <> 'Free' and duration is not null
        then now() + (duration || ' days')::interval
        else package_expires_at
      end
  where id = d.user_id;
  insert into public.earnings_log (user_id, source, description, coins, pkr_value)
  values (d.user_id, 'other', 'Package activated: ' || coalesce(d.package_name, 'Package'), 0, amount_credit);
  if pkg_price is not null and pkg_price > 0 then
    perform public.credit_referrer_on_package(d.user_id, pkg_price);
  end if;
  return jsonb_build_object('success', true, 'amount', amount_credit, 'package', d.package_name);
end;
$$;
