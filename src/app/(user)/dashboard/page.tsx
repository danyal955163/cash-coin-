import { redirect } from "next/navigation";
import GameDashboard from "@/components/game/GameDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // game_transactions is introduced by the Archery game migration; keep this compatible with the current generated DB types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as unknown as { from: (table: string) => any };
  const [{ data: profile }, { data: settings }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("site_settings").select("usd_rate").limit(1).maybeSingle(),
    db.from("game_transactions").select("description").eq("user_id", user.id).eq("transaction_type", "milestone"),
  ]);
  const gameProfile = (profile ?? {}) as unknown as Record<string, unknown>;
  const initialClaimed = (transactions ?? []).map((row: { description?: string | null }) => Number(row.description?.match(/Level (\d+)/)?.[1] ?? 0)).filter(Boolean);
  return <GameDashboard userId={user.id} gameWallet={Number(gameProfile.game_wallet ?? 0)} gameCoins={Number(gameProfile.game_coins ?? 0)} completedLevel={Number(gameProfile.game_level_completed ?? 0)} usdRate={Number(settings?.usd_rate ?? 280)} initialClaimed={initialClaimed} />;
}
