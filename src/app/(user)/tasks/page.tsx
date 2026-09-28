import { Gift } from "lucide-react";
import { redirect } from "next/navigation";
import TasksList from "@/components/tasks/TasksList";
import TimeWallOpenButton from "@/components/tasks/TimeWallOpenButton";
import { createClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, package_name, package_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  const expired = !!profile?.package_expires_at && new Date(profile.package_expires_at) < new Date();
  const packageName = expired ? "Free" : (profile?.package_name ?? "Free");
  const { data: packageData } = await supabase.from("packages_settings").select("daily_tasks").eq("name", packageName).maybeSingle();
  const fallbackLimits: Record<string, number> = { Free: 1, "200 PKR Package": 4, "300 PKR Package": 6, "400 PKR Package": 8, "500 PKR Package": 10 };
  const dailyLimit = packageData?.daily_tasks ?? fallbackLimits[packageName] ?? 1;
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [{ data: allTasks }, { data: userSubmissions }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, description, image_url, task_link, ad_url, coins_reward, task_type, ad_duration_seconds, ad_cooldown_seconds, ad_daily_limit, cooldown_minutes, timewall_placement_id")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    // Critical: never use another user's submissions to filter this page.
    supabase
      .from("user_tasks")
      .select("task_id, status, completed_at, created_at")
      .eq("user_id", user.id),
  ]);

  const timewallTaskIds = new Set((allTasks ?? []).filter((task) => task.task_type === "timewall").map((task) => task.id));
  const byTask = new Map<string, { status: string; completed_at: string | null; created_at: string }[]>();
  for (const submission of userSubmissions ?? []) {
    byTask.set(submission.task_id, [...(byTask.get(submission.task_id) ?? []), submission]);
  }
  const completedIds = new Set((userSubmissions ?? []).filter((submission) => submission.status === "pending" || submission.status === "approved").map((submission) => submission.task_id));
  const availableTasks = (allTasks ?? [])
    .filter((task) => task.task_type !== "one_time" || !completedIds.has(task.id))
    .map((task) => {
      const taskSubmissions = byTask.get(task.id) ?? [];
      const latest = taskSubmissions.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      return {
        ...task,
        task_type: task.task_type ?? "one_time",
        ad_duration_seconds: task.ad_duration_seconds ?? null,
        ad_cooldown_seconds: task.ad_cooldown_seconds ?? 10,
        ad_daily_limit: task.ad_daily_limit ?? 20,
        ad_completed_today: taskSubmissions.filter((submission) => submission.status === "approved" && new Date(submission.created_at) >= start).length,
        cooldown_minutes: task.cooldown_minutes ?? 0,
        timewall_placement_id: task.timewall_placement_id ?? null,
        last_submission_at: latest?.created_at ?? null,
      };
    });
  const completedCount = (userSubmissions ?? []).filter((submission) => !timewallTaskIds.has(submission.task_id) && (submission.status === "pending" || submission.status === "approved") && new Date(submission.created_at) >= start).length;
  const timewallPlacement = process.env.NEXT_PUBLIC_TIMEWALL_PLACEMENT_ID ?? "";

  console.log("Current user:", user.id);
  console.log("User submissions count:", userSubmissions?.length ?? 0);
  console.log("Available tasks:", availableTasks.length);

  return <section>
    <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-5 text-white shadow-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-100"><Gift size={17} /> Earn Extra Coins</p><h2 className="mt-2 text-2xl font-black">Complete offers on TimeWall and earn instantly!</h2></div>
        <TimeWallOpenButton placement={timewallPlacement} username={profile?.username ?? ""} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:scale-105">Open TimeWall Offerwall</TimeWallOpenButton>
      </div>
    </div>
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Tasks</p><h1 className="mt-2 text-3xl font-black text-slate-900">Complete tasks, earn coins</h1>{expired && <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm font-medium text-yellow-800">Your package expired. Renew to continue earning.</p>}</div>
    <TasksList tasks={availableTasks} userId={user.id} username={profile?.username ?? ""} completedCount={completedCount} dailyLimit={dailyLimit} />
  </section>;
}
