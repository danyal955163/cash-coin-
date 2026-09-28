"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  id: string;
  coin_rate: number | null;
  usd_rate: number | null;
  referral_reward_coins: number | null;
  ad_reward_coins: number | null;
  min_withdrawal_pkr: number | null;
  jazzcash_number: string | null;
  jazzcash_name: string | null;
  easypaisa_number: string | null;
  easypaisa_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
};

type FormState = Omit<Settings, "id">;
const emptyForm: FormState = { coin_rate: 100, usd_rate: 280, referral_reward_coins: 0, ad_reward_coins: 0, min_withdrawal_pkr: 200, jazzcash_number: "", jazzcash_name: "", easypaisa_number: "", easypaisa_name: "", bank_name: "", bank_account_number: "", bank_account_name: "" };

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string | number | null; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{hint && <span className="mt-1 block text-xs font-normal text-gray-400">{hint}</span>}<input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label>;
}

export default function SiteSettingsManager() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data, error } = await createClient().from("site_settings").select("*").limit(1).maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setSettingsId(data.id);
        setForm({
          coin_rate: data.coin_rate ?? 100, usd_rate: data.usd_rate ?? 280, referral_reward_coins: data.referral_reward_coins ?? 0, ad_reward_coins: data.ad_reward_coins ?? 0, min_withdrawal_pkr: data.min_withdrawal_pkr ?? 200,
          jazzcash_number: data.jazzcash_number ?? "", jazzcash_name: data.jazzcash_name ?? "", easypaisa_number: data.easypaisa_number ?? "", easypaisa_name: data.easypaisa_name ?? "", bank_name: data.bank_name ?? "", bank_account_number: data.bank_account_number ?? "", bank_account_name: data.bank_account_name ?? "",
        });
      }
    })();
  }, []);

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: ["coin_rate", "usd_rate", "referral_reward_coins", "ad_reward_coins", "min_withdrawal_pkr"].includes(key) ? Number(value) : value }));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settingsId) return toast.error("Site settings row is not configured yet.");
    setLoading(true);
    try {
      const { error } = await createClient().from("site_settings").update(form).eq("id", settingsId);
      if (error) throw error;
      toast.success("Settings saved");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save settings."); } finally { setLoading(false); }
  }

  return <div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Configuration</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Site Settings</h1></div><form onSubmit={save} className="max-w-4xl space-y-6">
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-gray-900">Coin Settings</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Coin Rate" value={form.coin_rate} type="number" hint="Coins equal to 1 PKR" onChange={(v) => set("coin_rate", v)} /><Field label="USD Rate" value={form.usd_rate} type="number" hint="PKR per USD" onChange={(v) => set("usd_rate", v)} /><Field label="Referral Reward Coins" value={form.referral_reward_coins} type="number" onChange={(v) => set("referral_reward_coins", v)} /><Field label="Ad Reward Coins" value={form.ad_reward_coins} type="number" onChange={(v) => set("ad_reward_coins", v)} /><Field label="Minimum Withdrawal (PKR)" value={form.min_withdrawal_pkr} type="number" onChange={(v) => set("min_withdrawal_pkr", v)} /></div></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-rose-700">JazzCash</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Account Number" value={form.jazzcash_number} onChange={(v) => set("jazzcash_number", v)} /><Field label="Account Holder Name" value={form.jazzcash_name} onChange={(v) => set("jazzcash_name", v)} /></div></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-emerald-700">EasyPaisa</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Account Number" value={form.easypaisa_number} onChange={(v) => set("easypaisa_number", v)} /><Field label="Account Holder Name" value={form.easypaisa_name} onChange={(v) => set("easypaisa_name", v)} /></div></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-blue-700">Bank</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Bank Name" value={form.bank_name} onChange={(v) => set("bank_name", v)} /><Field label="Account / IBAN Number" value={form.bank_account_number} onChange={(v) => set("bank_account_number", v)} /><Field label="Account Holder Name" value={form.bank_account_name} onChange={(v) => set("bank_account_name", v)} /></div></section>
    <button disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : "Save Settings"}</button>
  </form></div>;
}
