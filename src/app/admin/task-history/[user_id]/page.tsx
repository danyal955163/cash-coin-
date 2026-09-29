import { notFound } from "next/navigation";
import TaskHistoryDetail from "@/components/admin/TaskHistoryDetail";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTaskHistoryDetailPage({ params }: { params: { user_id: string } }) {
  const supabase = createClient();
  const profileResult = await supabase.from("profiles").select("*").eq("id", params.user_id).maybeSingle();
  const submissionsResult = await supabase.from("user_tasks").select("id, task_id, proof_image_url, coins_earned, status, created_at, game_id, account_name, terms_accepted").eq("user_id", params.user_id).order("created_at", { ascending: false });
  const profile = profileResult.data;
  const submissions = submissionsResult.data;
  if (!profile) notFound();
  const taskIds = Array.from(new Set((submissions ?? []).map((row) => row.task_id)));
  const { data: tasks } = taskIds.length ? await supabase.from("tasks").select("id, title, task_link, coins_reward, task_type").in("id", taskIds) : { data: [] };
  const taskMap = new Map((tasks ?? []).map((task) => [task.id, task]));
  const rows = (submissions ?? []).map((row) => { const task = taskMap.get(row.task_id); return { id: row.id, taskId: row.task_id, title: task?.title ?? "Deleted task", taskLink: task?.task_link ?? null, coinsReward: task?.coins_reward ?? row.coins_earned ?? 0, taskType: (task?.task_type === "repeated" || task?.task_type === "ad" ? task.task_type : "one_time") as "one_time" | "repeated" | "ad", proofImageUrl: row.proof_image_url, createdAt: row.created_at, status: row.status, gameId: row.game_id, accountName: row.account_name, termsAccepted: row.terms_accepted }; });
  const email = typeof (profile as unknown as { email?: unknown }).email === "string" ? (profile as unknown as { email: string }).email : "";
  return <TaskHistoryDetail rows={rows} user={{ username: profile.username ?? "Unknown user", email, packageName: profile.package_name ?? "Free", coins: profile.coins }} />;
}
