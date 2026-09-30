"use client";

import { Check, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import MonetagAdGate from "@/components/ads/MonetagAdGate";

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
  const [showAdGate, setShowAdGate] = useState(false);
  const selectedAmount = Number(amount ?? 0);
  const coinsNeeded = Number(selectedAmount * COINS_PER_PKR);

  function validateForm() {
    if (!selectedAmount) { toast.error("Select a withdrawal amount."); return false; }
    if (!accountName.trim()) { toast.error("Enter the account holder name."); return false; }
    if (!jazzcash.trim()) { toast.error("Enter JazzCash number."); return false; }
    if (selectedAmount < minimumPkr) { toast.error(`Minimum withdrawal is ${minimumPkr} PKR.`); return false; }
    if (withdrawalWallet < selectedAmount) { toast.error("You do not have enough withdrawal wallet balance."); return false; }
    if (coins < coinsNeeded) { toast.error(`Insufficient coins. You have ${coins}, need ${coinsNeeded}`); return false; }
    if (!/^03\d{9}$/.test(jazzcash.trim())) { toast.error("Enter a valid Pakistani JazzCash number (03XXXXXXXXX)."); return false; }
    return true;
  }

  async function performWithdrawalSubmit() {
    const payload = { p_amount_pkr: selectedAmount, p_coins_used: coinsNeeded, p_jazzcash_number: jazzcash.trim(), p_account_name: accountName.trim() };
    console.log("Withdrawal RPC payload:", payload);
    setLoading(true);
    try {
      const { error } = await createClient().rpc("request_withdrawal", payload);
      if (error) throw error;
      toast.success("Withdrawal requested! Coins deducted from wallet.");
      setAmount(null); setAccountName(""); setJazzcash("");
      window.setTimeout(() => router.refresh(), 800);
    } catch (error) {
      console.error("Withdrawal error:", error);
      if (error && typeof error === "object") toast.error(displayError(error as SupabaseError));
      else toast.error(`Error: ${String(error)} (no-code)`);
    } finally { setLoading(false); }
  }

  return <div><div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-3">{options.map((value) => { const disabled = withdrawalWallet < value || coins < value * COINS_PER_PKR; return <button key={value} type="button" disabled={disabled} onClick={() => setAmount(value)} className={`min-w-0 rounded-xl border p-3 text-left transition sm:p-5 ${amount === value ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200" : "border-gray-200 bg-white"} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50`}><div className="flex items-center justify-between gap-2"><p className="text-base font-bold text-gray-900 sm:text-xl">{value} PKR</p>{disabled ? <LockKeyhole size={16} className="shrink-0 text-slate-400" /> : amount === value ? <Check size={18} className="shrink-0 text-emerald-600" /> : null}</div><p className="mt-1 text-xs text-gray-500 sm:text-sm">({value * COINS_PER_PKR} coins)</p></button>; })}</div><div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-gray-700">Account Holder Name<input required type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Enter your full name" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base" /></label><label className="block text-sm font-medium text-gray-700">JazzCash Number<input required value={jazzcash} onChange={(e) => setJazzcash(e.target.value)} placeholder="03XXXXXXXXX" maxLength={11} inputMode="numeric" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base" /></label></div><button disabled={loading || !amount || withdrawalWallet < selectedAmount || coins < coinsNeeded} onClick={() => { if (validateForm()) setShowAdGate(true); }} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.01] disabled:opacity-60 sm:text-base">{loading ? "Submitting..." : "Submit Withdrawal"}</button></div><p className="mt-3 break-words text-xs text-gray-500 sm:text-sm">Available: {coins} coins = {(coins / COINS_PER_PKR).toFixed(2)} PKR · Approx. selected value: ${amount ? (amount / usdRate).toFixed(2) : "0.00"}</p><MonetagAdGate open={showAdGate} onClose={() => setShowAdGate(false)} onComplete={() => void performWithdrawalSubmit()} title="Watch Ad to Withdraw" /></div>;
}
