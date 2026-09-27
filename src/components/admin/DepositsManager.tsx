"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Deposit = Database["public"]["Tables"]["deposits"]["Row"];
const filters = ["all", "pending", "approved", "rejected"] as const;

export default function DepositsManager() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function loadDeposits() {
    const { data, error } = await createClient().from("deposits").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setDeposits(data ?? []);
  }
  useEffect(() => { void loadDeposits(); }, []);

  const visible = useMemo(() => deposits.filter((deposit) => {
    const matchesFilter = filter === "all" || deposit.status === filter;
    const query = search.toLowerCase();
    return matchesFilter && (!query || `${deposit.user_email ?? ""} ${deposit.transaction_id ?? ""}`.toLowerCase().includes(query));
  }), [deposits, filter, search]);

  async function runAction(id: string, action: "approve_deposit" | "reject_deposit") {
    setLoading(id);
    try {
      const { data, error } = await createClient().rpc(action, { p_deposit_id: id });
      if (error) throw error;
      const amount = data && typeof data === "object" && "amount" in data ? Number(data.amount) : 0;
      toast.success(action === "approve_deposit" ? `Approved! ${amount} PKR credited to Deposit Wallet` : "Deposit rejected.");
      await loadDeposits();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Action failed."); } finally { setLoading(null); }
  }

  return <div><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Finance</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Deposit History</h1><p className="mt-2 text-gray-600">Review deposits and credit Deposit Wallet</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search email or transaction ID" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></div><div className="mb-5 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === item ? "bg-emerald-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>{item}</button>)}</div><div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"><table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 text-gray-500"><tr>{["User Email", "Amount PKR", "Package", "Transaction ID", "Proof", "Date", "Status", "Actions"].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{visible.map((deposit) => { const proof = deposit.proof_image_url ?? deposit.proof_image ?? deposit.proof_url; return <tr key={deposit.id}><td className="whitespace-nowrap px-4 py-3">{deposit.user_email ?? "—"}</td><td className="whitespace-nowrap px-4 py-3">{deposit.amount_pkr ?? deposit.amount ?? 0}</td><td className="whitespace-nowrap px-4 py-3">{deposit.package_name ?? "—"}</td><td className="whitespace-nowrap px-4 py-3">{deposit.transaction_id ?? deposit.transaction_reference ?? "—"}</td><td className="px-4 py-3">{proof ? <a href={proof} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline">View Proof</a> : "—"}</td><td className="whitespace-nowrap px-4 py-3">{new Date(deposit.created_at).toLocaleDateString("en-PK")}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${deposit.status === "approved" ? "bg-emerald-100 text-emerald-700" : deposit.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{deposit.status}</span></td><td className="whitespace-nowrap px-4 py-3">{deposit.status === "pending" && <div className="flex gap-2"><button disabled={loading === deposit.id} onClick={() => void runAction(deposit.id, "approve_deposit")} className="rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={loading === deposit.id} onClick={() => void runAction(deposit.id, "reject_deposit")} className="rounded bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Reject</button></div>}</td></tr>; })}</tbody></table>{!visible.length && <p className="p-8 text-center text-sm text-gray-500">No deposits found.</p>}</div></div>;
}
