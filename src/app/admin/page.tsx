import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const [{ count: users }, { count: pendingDeposits }, { data: approvedDeposits }, { count: activeTasks }, { data: recent }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("deposits").select("amount_pkr, amount").eq("status", "approved"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("deposits").select("id, user_email, amount_pkr, amount, package_name, transaction_id, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
  ]);
  const approvedTotal = (approvedDeposits ?? []).reduce((sum, row) => sum + Number(row.amount_pkr ?? row.amount ?? 0), 0);
  const stats = [
    ["Total Users", users ?? 0, "Registered profiles"],
    ["Pending Deposits", pendingDeposits ?? 0, "Need review"],
    ["Approved Deposit Amount", `${approvedTotal} PKR`, "Total credited"],
    ["Active Tasks", activeTasks ?? 0, "Currently available"],
  ];

  return (
    <div>
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-900/10 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Overview</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Admin Dashboard</h1><p className="mt-2 text-sm text-emerald-50">A clear view of your platform, all in one place.</p></div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([title, value, description]) => <article key={String(title)} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold text-gray-500">{title}</p><p className="mt-3 text-3xl font-bold text-gray-900">{value}</p><p className="mt-2 text-sm text-gray-500">{description}</p></article>)}</div>
      <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold text-gray-900">Recent Pending Deposits</h2><Link href="/admin/deposits" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View all</Link></div><div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 text-gray-500"><tr><th className="px-3 py-3">User Email</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Package</th><th className="px-3 py-3">Transaction ID</th><th className="px-3 py-3">Date</th></tr></thead><tbody className="divide-y divide-gray-100">{(recent ?? []).map((deposit) => <tr key={deposit.id}><td className="px-3 py-3">{deposit.user_email ?? "—"}</td><td className="px-3 py-3">{deposit.amount_pkr ?? deposit.amount ?? 0} PKR</td><td className="px-3 py-3">{deposit.package_name ?? "—"}</td><td className="px-3 py-3">{deposit.transaction_id ?? "—"}</td><td className="px-3 py-3">{new Date(deposit.created_at).toLocaleDateString("en-PK")}</td></tr>)}</tbody></table>{!recent?.length && <p className="py-8 text-center text-sm text-gray-500">No pending deposits.</p>}</div></section>
    </div>
  );
}
