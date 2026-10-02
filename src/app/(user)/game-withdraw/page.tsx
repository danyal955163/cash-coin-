import Link from "next/link";
import { redirect } from "next/navigation";
import GameWithdrawalForm from "@/components/game/GameWithdrawalForm";
import { createClient } from "@/lib/supabase/server";

export default async function GameWithdrawPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as unknown as { from: (table: string) => any };
  const [{ data: profile }, { data: freeTasks }, { data: withdrawals }] = await Promise.all([
    db.from("profiles").select("game_wallet").eq("id", user.id).maybeSingle(),
    db.from("user_tasks").select("task_id, status, tasks!inner(is_free_task)").eq("user_id", user.id).eq("status", "approved").eq("tasks.is_free_task", true),
    db.from("game_withdrawals").select("amount_pkr, status, free_tasks_completed, visible_to_admin, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);
  const balance = Number(profile?.game_wallet ?? 0); const completedTasks = freeTasks?.length ?? 0;
  return <section className="mx-auto max-w-3xl space-y-5"><div><Link href="/dashboard" className="text-sm font-bold text-emerald-600">← Back to Game Dashboard</Link><p className="mt-5 text-xs font-black uppercase tracking-widest text-emerald-600">Separate wallet</p><h1 className="mt-2 text-3xl font-black text-slate-900">Game Wallet Withdrawal</h1><p className="mt-2 text-sm text-slate-500">Minimum withdrawal is 1,400 PKR. Admin verification unlocks after 5 approved Free Tasks.</p></div><div className="rounded-3xl bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Available Game Wallet</p><p className="mt-2 text-4xl font-black">{balance.toLocaleString()} PKR</p></div>{balance >= 1400 ? <GameWithdrawalForm balance={balance} completedTasks={completedTasks} /> : <div className="rounded-2xl bg-amber-50 p-5 text-sm font-bold text-amber-800">You need at least 1,400 PKR in your Game Wallet to withdraw.</div>}<section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="font-black text-slate-900">Recent requests</h2><div className="mt-3 space-y-2">{withdrawals?.map((row: { amount_pkr: number; status: string; free_tasks_completed: number; visible_to_admin: boolean; created_at: string }) => <div key={row.created_at} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>Rs.{row.amount_pkr} · {new Date(row.created_at).toLocaleDateString("en-PK")}</span><span className="font-bold text-emerald-700">{row.visible_to_admin ? "Unlocked" : `${row.free_tasks_completed}/5 tasks`}</span></div>)}{!withdrawals?.length && <p className="text-sm text-slate-500">No game withdrawal requests yet.</p>}</div></section></section>;
}
