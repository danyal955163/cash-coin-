"use client";

import { Check, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const options = [200, 400, 600, 800, 3000];
const COINS_PER_PKR = 100;
type Props = { coins: number; withdrawalWallet: number; usdRate: number; minimumPkr: number };
type SupabaseError = { message?: string; code?: string };
function displayError(error: SupabaseError) { return `Error: ${error.message ?? "Unknown error"} (${error.code ?? "no-code"})`; }

export default function WithdrawalForm({ coins, withdrawalWallet, usdRate, minimumPkr }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [accountName, setAccountName] = useState("");
  const [jazzcash, setJazzcash] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedAmount = Number(amount ?? 0);
  const coinsNeeded = Number(selectedAmount * COINS_PER_PKR);

  async function submit() {
    if (!selectedAmount) return toast.error("Select a withdrawal amount.");
    if (!accountName.trim()) return toast.error("Enter the account holder name.");
    if (!jazzcash.trim()) return toast.error("Enter JazzCash number.");
    if (selectedAmount < minimumPkr) return toast.error(`Minimum withdrawal is ${minimumPkr} PKR.`);
    if (withdrawalWallet < selectedAmount) return toast.error("You do not have enough withdrawal wallet balance.");
    if (coins < coinsNeeded) return toast.error(`Insufficient coins. You have ${coins}, need ${coinsNeeded}`);
    const jazzcashNumber = jazzcash.trim();
    if (!/^03\d{9}$/.test(jazzcashNumber)) return toast.error("Enter a valid Pakistani JazzCash number (03XXXXXXXXX).");

    const payload = { p_amount_pkr: Number(selectedAmount), p_coins_used: Number(coinsNeeded), p_jazzcash_number: jazzcashNumber, p_account_name: accountName.trim() };
    console.log("Withdrawal RPC payload:", payload);
    setLoading(true);
    try {
      const { error } = await createClient().rpc("request_withdrawal", payload);
      if (error) throw error;
      toast.success("Withdrawal requested! Coins deducted from wallet.");
      setAmount(null);
      setAccountName("");
      setJazzcash("");
      window.setTimeout(() => router.refresh(), 800);
    } catch (error) {
      console.error("Withdrawal error:", error);
      if (error && typeof error === "object") toast.error(displayError(error as SupabaseError));
      else toast.error(`Error: ${String(error)} (no-code)`);
    } finally { setLoading(false); }
  }

  return <div><div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-3">{options.map((value) => { const disabled = withdrawalWallet < value || coins < value * COINS_PER_PKR; return <button key={value} type="button" disabled={disabled} onClick={() => setAmount(value)} className={`min-w-0 rounded-xl border p-3 text-left transition sm:p-5 ${amount === value ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200" : "border-gray-200 bg-white"} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50`}><div className="flex items-center justify-between gap-2"><p className="text-base font-bold text-gray-900 sm:text-xl">{value} PKR</p>{disabled ? <LockKeyhole size={16} className="shrink-0 text-slate-400" /> : amount === value ? <Check size={18} className="shrink-0 text-emerald-600" /> : null}</div><p className="mt-1 text-xs text-gray-500 sm:text-sm">({value * COINS_PER_PKR} coins)</p></button>; })}</div><div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-gray-700">Account Holder Name<input required type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Enter your full name" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base" /></label><label className="block text-sm font-medium text-gray-700">JazzCash Number<input required value={jazzcash} onChange={(e) => setJazzcash(e.target.value)} placeholder="03XXXXXXXXX" maxLength={11} inputMode="numeric" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base" /></label></div><button disabled={loading || !amount || withdrawalWallet < selectedAmount || coins < coinsNeeded} onClick={() => void submit()} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.01] disabled:opacity-60 sm:text-base">{loading ? "Submitting..." : "Submit Withdrawal"}</button></div><p className="mt-3 break-words text-xs text-gray-500 sm:text-sm">Available: {coins} coins = {(coins / COINS_PER_PKR).toFixed(2)} PKR · Approx. selected value: ${amount ? (amount / usdRate).toFixed(2) : "0.00"}</p></div>;
}
