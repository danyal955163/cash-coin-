import { createClient } from "@/lib/supabase/server";

export async function refillArrows(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data: profile } = await supabase
    .from("profiles")
    .select("game_arrows, game_last_arrow_refill")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return 0;
  const current = Math.max(0, Number(profile.game_arrows ?? 20));
  if (current >= 20) return current;
  const last = profile.game_last_arrow_refill ? new Date(profile.game_last_arrow_refill) : new Date();
  const arrowsToAdd = Math.floor(Math.max(0, Date.now() - last.getTime()) / 1_200_000);
  if (arrowsToAdd <= 0) return current;
  const next = Math.min(20, current + arrowsToAdd);
  await supabase.from("profiles").update({ game_arrows: next, game_last_arrow_refill: new Date().toISOString() }).eq("id", userId);
  return next;
}
