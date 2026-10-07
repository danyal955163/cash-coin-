"use client";

import { Copy } from "lucide-react";
import toast from "react-hot-toast";

type Props = { title: string; number?: string | null; name?: string | null; amount: number; tone: "jazz" | "easy" | "bank"; bankName?: string | null; label?: string };

export default function PaymentMethodCard({ title, number, name, amount, tone, bankName, label = "Account Number" }: Props) {
  if (!number?.trim()) return null;
  const colors = { jazz: "from-amber-500 to-orange-600", easy: "from-emerald-600 to-teal-700", bank: "from-teal-700 to-emerald-900" };
  const copy = async () => {
    try { await navigator.clipboard.writeText(number); toast.success("Number copied!"); }
    catch { toast.error("Unable to copy number."); }
  };
  return <article className={`rounded-3xl bg-gradient-to-br ${colors[tone]} p-5 text-white shadow-lg shadow-slate-900/10 ring-1 ring-white/15 sm:p-6`}>
    <h2 className="text-lg font-black">{title}</h2>
    {tone === "bank" && <p className="mt-3 text-sm text-white/80">Bank Name: <span className="font-bold text-white">{bankName || "—"}</span></p>}
    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/75">{label}</p>
    <div className="mt-1 flex items-center gap-2"><p className="break-all text-lg font-black">{number}</p><button type="button" onClick={() => void copy()} aria-label={`Copy ${title} number`} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold ring-1 ring-white/20 hover:bg-white/30"><Copy size={14} /> Copy</button></div>
    <p className="mt-3 text-sm text-white/90">Account Holder: <span className="font-bold text-white">{name || "Not provided"}</span></p>
    <p className="mt-1 text-sm font-bold text-white">Send exactly {amount || "the selected amount"} PKR</p>
  </article>;
}
