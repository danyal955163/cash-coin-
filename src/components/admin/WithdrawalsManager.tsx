"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Withdrawal = Database["public"]["Tables"]["withdrawals"]["Row"];
const filters = ["all", "pending", "approved", "rejected"] as const;
function errorText(error: { message?: string; code?: string }) { return `Error: ${error.message ?? "Unknown error"} (${error.code ?? "no-code"})`; }
function badge(status: string) { return status === "approved" ? "✅ Approved & Paid" : status === "rejected" ? "❌ Rejected (Refunded)" : "⏳ Pending Approval"; }

export default function WithdrawalsManager() {
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  async function load() { const { data, error } = await createClient().from("withdrawals").select("*").order("created_at", { ascending: false }); if (error) { console.error("Withdrawals load error:", error); toast.error(errorText(error)); } else setRows(data ?? []); }
  useEffect(() => { void load(); }, []);
  const visible = useMemo(() => { const term = search.trim().toLowerCase(); return rows.filter((row) => (filter === "all" || row.status === filter) && (!term || (row.user_email ?? "").toLowerCase().includes(term) || (row.jazzcash_number ?? "").toLowerCase().includes(term))); }, [rows, filter, search]);
  async function action(row: Withdrawal, rpc: "approve_withdrawal" | "reject_withdrawal") {
    if (rpc === "reject_withdrawal" && !window.confirm("Reject this withdrawal? Coins will be refunded to user.")) return;
    setLoading(row.id);
    try { const { error } = await createClient().rpc(rpc, { p_withdrawal_id: row.id }); if (error) throw error; toast.success(rpc === "approve_withdrawal" ? "Approved! Coins stay deducted." : "Rejected. Coins refunded to user."); await load(); } catch (error) { console.error("Withdrawal action error:", error); if (error && typeof error === "object") toast.error(errorText(error as { message?: string; code?: string })); else toast.error(`Error: ${String(error)} (no-code)`); } finally { setLoading(null); }
  }
  return <div><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Finance</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Withdrawals</h1></div><div className="mb-5 flex flex-wrap items-center gap-2"><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === item ? "bg-emerald-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>{item}</button>)}</div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search email or JazzCash" className="min-w-56 flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500" /></div><div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"><table className="min-w-[980px] w-full text-left text-sm"><thead className="border-b border-gray-200 text-gray-500"><tr>{["User Email", "Account Name", "JazzCash Number", "Amount PKR", "Coins Used", "Date", "Status", "Actions"].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{visible.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.user_email ?? "—"}</td><td className="px-4 py-3">{row.account_name ?? "—"}</td><td className="px-4 py-3">{row.jazzcash_number ?? "—"}</td><td className="px-4 py-3">{row.amount_pkr ?? row.amount} PKR</td><td className="px-4 py-3">{row.coins_used ?? "—"}</td><td className="px-4 py-3">{new Date(row.created_at).toLocaleDateString("en-PK")}</td><td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${row.status === "approved" ? "bg-emerald-100 text-emerald-700" : row.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{badge(row.status)}</span></td><td className="whitespace-nowrap px-4 py-3">{row.status === "pending" && <><button disabled={loading === row.id} onClick={() => void action(row, "approve_withdrawal")} className="mr-2 rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={loading === row.id} onClick={() => void action(row, "reject_withdrawal")} className="rounded bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Reject</button></>}</td></tr>)}</tbody></table>{!visible.length && <p className="p-8 text-center text-sm text-gray-500">No withdrawals found.</p>}</div></div>;
}
