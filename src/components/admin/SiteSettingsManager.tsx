"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";

const fields = [
  ["coin_rate", "Coin Rate", "100 = 1 PKR", "number"],
  ["usd_rate", "USD Rate", "1 USD = X PKR", "number"],
  ["referral_reward_coins", "Referral Reward Coins", "Coins awarded to a referrer", "number"],
  ["ad_reward_coins", "Ad Reward Coins", "Coins awarded for an ad", "number"],
  ["min_withdrawal_pkr", "Minimum Withdrawal (PKR)", "Minimum cashout amount", "number"],
  ["jazzcash_number", "JazzCash Number", "Payment account number", "text"],
  ["easypaisa_number", "EasyPaisa Number", "Payment account number", "text"],
  ["bank_account", "Bank Account", "Bank account details", "text"],
] as const;
const numericKeys = new Set(["coin_rate", "usd_rate", "referral_reward_coins", "ad_reward_coins", "min_withdrawal_pkr"]);

type Values = Record<string, string>;

export default function SiteSettingsManager() {
  const [values, setValues] = useState<Values>({}); const [loading, setLoading] = useState(false);
  useEffect(() => { void (async () => { const { data, error } = await createClient().from("site_settings").select("key, value"); if (error) toast.error(error.message); else setValues(Object.fromEntries((data ?? []).map((row) => [row.key, typeof row.value === "string" || typeof row.value === "number" ? String(row.value) : JSON.stringify(row.value)]))); })(); }, []);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); try { const supabase = createClient(); for (const [key] of fields) { const raw = values[key] ?? ""; const value = numericKeys.has(key) ? Number(raw) : raw; const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" }); if (error) throw error; } toast.success("Settings saved"); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save settings."); } finally { setLoading(false); } }
  return <div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Configuration</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Site Settings</h1></div><form onSubmit={save} className="max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, label, hint, type]) => <label key={key} className="block text-sm font-medium text-gray-700">{label}<span className="mt-1 block text-xs font-normal text-gray-400">{hint}</span><input type={type} value={values[key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label>)}</div><button disabled={loading} className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : "Save Settings"}</button></form></div>;
}
