"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const options = [200, 400, 600, 800, 3000];
export default function WithdrawalForm({ userId, email, coins, coinRate, usdRate, minimumPkr }: { userId: string; email: string; coins: number; coinRate: number; usdRate: number; minimumPkr: number }) {
  const [amount, setAmount] = useState<number | null>(null); const [jazzcash, setJazzcash] = useState(""); const [loading, setLoading] = useState(false); const selectedCoins = (amount ?? 0) * coinRate;
  async function submit() {
    if (!amount) return toast.error("Select a withdrawal amount."); if (amount < minimumPkr) return toast.error(`Minimum withdrawal is ${minimumPkr} PKR.`); if (coins < selectedCoins) return toast.error("You do not have enough coins."); if (!/^03\d{9}$/.test(jazzcash)) return toast.error("Enter a valid Pakistani JazzCash number (03XXXXXXXXX).");
    setLoading(true); try { const { error } = await createClient().from("withdrawals").insert({ user_id: userId, user_email: email, amount_pkr: amount, amount, coins_used: selectedCoins, jazzcash_number: jazzcash, payment_method: "JazzCash", status: "pending" }); if (error) throw error; toast.success("Withdrawal requested! Admin will process soon."); setTimeout(() => location.assign("/wallet"), 2000); } catch (error) { toast.error(error instanceof Error ? error.message : "Network error. Please try again."); } finally { setLoading(false); }
  }
  return <div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{options.map((value) => { const disabled = coins < value * coinRate || value < minimumPkr; return <button key={value} disabled={disabled} onClick={() => setAmount(value)} className={`rounded-xl border p-5 text-left transition ${amount === value ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200" : "border-gray-200 bg-white"} disabled:cursor-not-allowed disabled:opacity-40`}><p className="text-xl font-bold text-gray-900">{value} PKR</p><p className="mt-1 text-sm text-gray-500">({value * coinRate} coins)</p></button>; })}</div><div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><label className="block text-sm font-medium text-gray-700">JazzCash Number<input required value={jazzcash} onChange={(e) => setJazzcash(e.target.value)} placeholder="03XXXXXXXXX" maxLength={11} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><button disabled={loading} onClick={() => void submit()} className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Submitting..." : "Submit Withdrawal"}</button></div><p className="mt-3 text-sm text-gray-500">Rate: {coinRate} coins = 1 PKR · Minimum: {minimumPkr} PKR · Approx. selected value: ${amount ? (amount / usdRate).toFixed(2) : "0.00"}</p></div>;
}
