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
  daily_reset_hour: number | null;
  jazzcash_number: string | null;
  jazzcash_name: string | null;
  easypaisa_number: string | null;
  easypaisa_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
};
type FormState = Omit<Settings, "id">;
const defaults: FormState = { coin_rate: 100, usd_rate: 278, referral_reward_coins: 500, ad_reward_coins: 10, min_withdrawal_pkr: 200, daily_reset_hour: 0, jazzcash_number: "", jazzcash_name: "", easypaisa_number: "", easypaisa_name: "", bank_name: "", bank_account_number: "", bank_account_name: "" };

function Field({ label, value, onChange, type = "text", hint, min, max }: { label: string; value: string | number | null; onChange: (value: string) => void; type?: string; hint?: string; min?: number; max?: number }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{hint && <span className="mt-1 block text-xs font-normal text-gray-400">{hint}</span>}<input type={type} min={min} max={max} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label>;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState<FormState>(defaults);
  const [loading, setLoading] = useState(false);

  const applyRow = (row: Settings) => { const { id, ...values } = row; if (!id) return; setSettings(row); setForm({ ...defaults, ...values }); };
  const load = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (!data) {
      const { data: newRow, error: insertError } = await supabase.from("site_settings").insert(defaults).select().single();
      if (insertError) { toast.error(insertError.message); return; }
      if (newRow) applyRow(newRow as Settings);
      return;
    }
    applyRow(data as Settings);
  };
  useEffect(() => { void load(); }, []);

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: ["coin_rate", "usd_rate", "referral_reward_coins", "ad_reward_coins", "min_withdrawal_pkr", "daily_reset_hour"].includes(key) ? Number(value) : value }));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings?.id) { toast.error("Settings not loaded yet"); return; }
    const values = { ...form, coin_rate: Number(form.coin_rate) || 100, usd_rate: Number(form.usd_rate) || 278, referral_reward_coins: Number(form.referral_reward_coins) || 500, ad_reward_coins: Number(form.ad_reward_coins) || 10, min_withdrawal_pkr: Number(form.min_withdrawal_pkr) || 200, daily_reset_hour: Math.min(23, Math.max(0, Number(form.daily_reset_hour) || 0)), jazzcash_number: form.jazzcash_number || "", jazzcash_name: form.jazzcash_name || "", easypaisa_number: form.easypaisa_number || "", easypaisa_name: form.easypaisa_name || "", bank_name: form.bank_name || "", bank_account_number: form.bank_account_number || "", bank_account_name: form.bank_account_name || "" };
    console.log("Saving with id:", settings.id, "values:", values);
    setLoading(true);
    try {
      const { error } = await createClient().from("site_settings").update(values).eq("id", settings.id);
      if (error) throw error;
      toast.success("Settings saved!");
      const { data: fresh, error: refetchError } = await createClient().from("site_settings").select("*").limit(1).maybeSingle();
      if (refetchError) console.error("Settings refetch error:", refetchError);
      if (fresh) applyRow(fresh as Settings);
    } catch (error) { console.error("Save error:", error); toast.error(`Save failed: ${error instanceof Error ? error.message : "Unknown error"}`); } finally { setLoading(false); }
  }

  return <div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Configuration</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Site Settings</h1></div><form onSubmit={save} className="max-w-4xl space-y-6">
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-gray-900">Coin Settings</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Coin Rate" value={form.coin_rate} type="number" hint="Coins equal to 1 PKR" onChange={(v) => set("coin_rate", v)} /><Field label="USD Rate" value={form.usd_rate} type="number" hint="PKR per USD" onChange={(v) => set("usd_rate", v)} /><Field label="Referral Reward Coins" value={form.referral_reward_coins} type="number" onChange={(v) => set("referral_reward_coins", v)} /><Field label="Ad Reward Coins" value={form.ad_reward_coins} type="number" onChange={(v) => set("ad_reward_coins", v)} /><Field label="Minimum Withdrawal (PKR)" value={form.min_withdrawal_pkr} type="number" onChange={(v) => set("min_withdrawal_pkr", v)} /><Field label="Daily Reset Hour (0-23)" value={form.daily_reset_hour} type="number" min={0} max={23} hint="0 = midnight, 9 = 9 AM. Users get new tasks at this hour daily." onChange={(v) => set("daily_reset_hour", v)} /></div></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-rose-700">JazzCash</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Account Number" value={form.jazzcash_number} onChange={(v) => set("jazzcash_number", v)} /><Field label="Account Holder Name" value={form.jazzcash_name} onChange={(v) => set("jazzcash_name", v)} /></div></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-emerald-700">EasyPaisa</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Account Number" value={form.easypaisa_number} onChange={(v) => set("easypaisa_number", v)} /><Field label="Account Holder Name" value={form.easypaisa_name} onChange={(v) => set("easypaisa_name", v)} /></div></section>
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-blue-700">Bank</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Bank Name" value={form.bank_name} onChange={(v) => set("bank_name", v)} /><Field label="Account / IBAN Number" value={form.bank_account_number} onChange={(v) => set("bank_account_number", v)} /><Field label="Account Holder Name" value={form.bank_account_name} onChange={(v) => set("bank_account_name", v)} /></div></section>
    <button disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : "Save Settings"}</button>
  </form></div>;
}
