import { redirect } from "next/navigation";
import TasksList from "@/components/tasks/TasksList";
import { createClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("username, package_name, package_expires_at").eq("id", user.id).maybeSingle();
  const expired = !!profile?.package_expires_at && new Date(profile.package_expires_at) < new Date(); const packageName = expired ? "Free" : (profile?.package_name ?? "Free");
  const { data: packageData } = await supabase.from("packages_settings").select("daily_tasks").eq("name", packageName).maybeSingle();
  const fallbackLimits: Record<string, number> = { Free: 1, "200 PKR Package": 4, "300 PKR Package": 6, "400 PKR Package": 8, "500 PKR Package": 10 }; const dailyLimit = packageData?.daily_tasks ?? fallbackLimits[packageName] ?? 1;
  const start = new Date(); start.setHours(0, 0, 0, 0); const { data: todayRows } = await supabase.from("user_tasks").select("task_id, status").eq("user_id", user.id).gte("created_at", start.toISOString()).in("status", ["pending", "approved"]);
  const { data: allSubmissions } = await supabase.from("user_tasks").select("task_id").eq("user_id", user.id);
  const submittedIds = (allSubmissions ?? []).map((row) => row.task_id); const completedCount = todayRows?.length ?? 0;
  const { data: tasks } = await supabase.from("tasks").select("id, title, description, image_url, task_link, coins_reward").eq("status", "active").order("created_at", { ascending: false });
  return <section><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Tasks</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Complete tasks, earn coins</h1>{expired && <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm font-medium text-yellow-800">Your package expired. Renew to continue earning.</p>}</div><TasksList tasks={tasks ?? []} userId={user.id} submittedIds={submittedIds} completedCount={completedCount} dailyLimit={dailyLimit} /></section>;
}
