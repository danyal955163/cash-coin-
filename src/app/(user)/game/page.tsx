import { redirect } from "next/navigation";
import ArcheryGame from "@/components/game/ArcheryGame";
import { createClient } from "@/lib/supabase/server";

export default async function GamePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const gameProfile = (profile ?? {}) as Record<string, unknown>;
  const arrows = Math.min(20, Math.max(0, Number(gameProfile.game_arrows ?? 20)));
  const completed = Math.min(400, Math.max(0, Number(gameProfile.game_level_completed ?? 0)));

  return (
    <section className="-mx-4 -mt-4 min-h-[calc(100vh-5rem)] bg-slate-100 px-2 py-3 sm:-mx-6 sm:px-4 lg:-mx-8">
      <ArcheryGame
        userId={user.id}
        initialLevel={completed}
        initialCoins={Number(gameProfile.game_coins ?? 0)}
        initialArrows={arrows}
      />
    </section>
  );
}
