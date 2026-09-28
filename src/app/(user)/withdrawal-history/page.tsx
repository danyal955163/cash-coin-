import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import WithdrawalStatusList from "@/components/withdrawal/WithdrawalStatusList";
import { createClient } from "@/lib/supabase/server";

export default async function WithdrawalHistoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: withdrawals, error } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) console.error("Withdrawal history error:", error);
  return <section className="space-y-6"><div><Link href="/wallet" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"><ArrowLeft size={16} /> Back to Wallet</Link><p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Withdrawal History</p><h1 className="mt-2 text-3xl font-black text-slate-900">All withdrawals</h1><p className="mt-2 text-sm text-slate-500">Track approval status and refunded coins.</p></div><WithdrawalStatusList withdrawals={withdrawals ?? []} title="All Withdrawal Requests" /></section>;
}
