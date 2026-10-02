import { createClient } from "@/lib/supabase/server";

export async function checkMilestones(userId: string, currentLevel: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const [{ data: milestones }, { data: earned }] = await Promise.all([
    supabase.from("game_milestones").select("level_required, reward_pkr").lte("level_required", currentLevel),
    supabase.from("game_transactions").select("description").eq("user_id", userId).eq("transaction_type", "milestone"),
  ]);
  const earnedLevels = new Set((earned ?? []).map((row: { description?: string | null }) => Number(row.description?.match(/Level (\d+)/)?.[1] ?? 0)));
  const newlyEarned: number[] = [];
  for (const milestone of milestones ?? []) {
    if (earnedLevels.has(milestone.level_required)) continue;
    const { error } = await supabase.rpc("credit_game_milestone", {
      p_user_id: userId,
      p_amount: Number(milestone.reward_pkr),
      p_level: milestone.level_required,
    });
    if (!error) newlyEarned.push(milestone.level_required);
  }
  return newlyEarned;
}
