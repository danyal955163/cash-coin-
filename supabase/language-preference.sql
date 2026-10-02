-- CashCoin language preference
alter table public.profiles
  add column if not exists language_preference text not null default 'en';

alter table public.profiles
  drop constraint if exists profiles_language_preference_check;

alter table public.profiles
  add constraint profiles_language_preference_check
  check (language_preference in ('en', 'ur'));
