import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getProfile(userId: string): Promise<{
  data: Database["public"]["Tables"]["profiles"]["Row"] | null;
  error: Error | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return { data, error };
}

export async function applyReferral(userId: string, referralCode: string) {
  const code = referralCode.trim();
  if (!code) return { applied: false, error: null };

  const supabase = createClient();
  const { data: referrer, error: referrerError } = await supabase
    .from("profiles")
    .select("id, username, coins")
    .eq("username", code)
    .maybeSingle();

  if (referrerError) return { applied: false, error: referrerError };
  if (!referrer) return { applied: false, error: null };

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: userId, referred_by: referrer.username },
    { onConflict: "id" },
  );
  if (profileError) return { applied: false, error: profileError };

  const { data: setting, error: settingError } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "referral_reward_coins")
    .maybeSingle();
  if (settingError) return { applied: true, error: settingError };

  const reward = Number(setting?.value ?? 0);
  if (Number.isFinite(reward) && reward > 0) {
    const { data: latestReferrer, error: latestError } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", referrer.id)
      .maybeSingle();
    if (latestError) return { applied: true, error: latestError };

    const { error: rewardError } = await supabase
      .from("profiles")
      .update({ coins: Number(latestReferrer?.coins ?? referrer.coins ?? 0) + reward })
      .eq("id", referrer.id);
    if (rewardError) return { applied: true, error: rewardError };
  }

  return { applied: true, error: null };
}

export type CurrentUser = User;
