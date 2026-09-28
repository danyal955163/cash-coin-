"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, ExternalLink, TimerReset } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

type AdState = "idle" | "watching" | "claimable" | "claiming" | "cooldown" | "daily_limit_reached";

type AdTask = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  task_link: string | null;
  ad_url: string | null;
  coins_reward: number;
  ad_duration_seconds: number | null;
  cooldown_seconds: number | null;
};

type ClaimResult = { coins_earned?: number; coins?: number; cooldown_seconds?: number };

export default function AdTaskCard({ task, userId, disabled }: { task: AdTask; userId: string; disabled: boolean }) {
  const router = useRouter();
  const duration = Math.max(1, task.ad_duration_seconds ?? 15);
  const defaultCooldown = Math.max(5, task.cooldown_seconds ?? 10);
  const adUrl = task.ad_url || process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URL || task.task_link;
  const [state, setState] = useState<AdState>(disabled ? "daily_limit_reached" : "idle");
  const [remaining, setRemaining] = useState(duration);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const watchIntervalRef = useRef<number | null>(null);
  const cooldownIntervalRef = useRef<number | null>(null);
  const claimLockRef = useRef(false);

  const clearWatchInterval = () => {
    if (watchIntervalRef.current !== null) {
      window.clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
  };

  const clearCooldownInterval = () => {
    if (cooldownIntervalRef.current !== null) {
      window.clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  };

  const startCooldown = (seconds: number) => {
    clearCooldownInterval();
    const safeSeconds = Math.max(1, Math.ceil(seconds));
    setCooldownLeft(safeSeconds);
    setState("cooldown");
    cooldownIntervalRef.current = window.setInterval(() => {
      setCooldownLeft((value) => {
        if (value <= 1) {
          clearCooldownInterval();
          setState(disabled ? "daily_limit_reached" : "idle");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    let cancelled = false;
    const loadCooldown = async () => {
      if (disabled) return;
      const { data, error } = await createClient()
        .from("user_tasks")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("task_id", task.id)
        .eq("status", "approved")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || error || !data?.completed_at) return;
      const elapsed = (Date.now() - new Date(data.completed_at).getTime()) / 1000;
      const left = defaultCooldown - elapsed;
      if (left > 0) startCooldown(left);
    };
    void loadCooldown();
    return () => {
      cancelled = true;
      clearWatchInterval();
      clearCooldownInterval();
    };
  }, [defaultCooldown, disabled, task.id, userId]);

  useEffect(() => {
    if (disabled && state !== "watching" && state !== "claiming") setState("daily_limit_reached");
  }, [disabled, state]);

  const handleWatchAd = () => {
    if (state !== "idle" || disabled) return;
    if (!adUrl) { toast.error("Ad URL not configured"); return; }
    window.open(adUrl, "_blank", "noopener,noreferrer");
    setRemaining(duration);
    setState("watching");
    clearWatchInterval();
    watchIntervalRef.current = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearWatchInterval();
          setState("claimable");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const handleClaim = async () => {
    if (state !== "claimable" || claimLockRef.current) return;
    claimLockRef.current = true;
    setState("claiming");
    try {
      const { data, error } = await createClient().rpc("claim_ad_task", { p_task_id: task.id });
      if (error) throw error;
      const result = (data ?? {}) as ClaimResult;
      toast.success(`+${result.coins_earned ?? result.coins ?? task.coins_reward} coins earned!`);
      startCooldown(result.cooldown_seconds ?? defaultCooldown);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to claim this ad.";
      toast.error(message);
      const cooldownMatch = message.match(/cooldown[^0-9]*(\d+)/i);
      if (cooldownMatch) startCooldown(Number(cooldownMatch[1]));
      else {
        claimLockRef.current = false;
        setState("claimable");
      }
    }
  };

  const progress = ((duration - remaining) / duration) * 100;
  const isBusy = state === "watching" || state === "claiming" || state === "cooldown" || state === "daily_limit_reached";

  return (
    <article className="overflow-hidden rounded-2xl border-l-4 border-orange-500 bg-white shadow-sm ring-1 ring-slate-200">
      {task.image_url && <img src={task.image_url} alt="" className="h-36 w-full object-cover" />}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">Ad - {duration} sec</span>
            <h2 className="mt-3 font-black text-slate-900">{task.title}</h2>
          </div>
          <span className="whitespace-nowrap rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-700">+{task.coins_reward}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">{task.description ?? "Watch this ad to earn coins."}</p>

        {state === "watching" && (
          <div className="mt-4 rounded-xl bg-orange-50 p-4 text-center text-sm font-bold text-orange-700">
            <Clock3 className="mr-1 inline" size={16} /> Watching... {remaining}s remaining
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-orange-100"><div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        {state === "claimable" && <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700"><CheckCircle2 className="mr-1 inline" size={17} /> Ad completed! Claim your coins now.</div>}
        {state === "cooldown" && <div className="mt-4 rounded-xl bg-slate-100 p-4 text-center text-sm font-bold text-slate-600"><TimerReset className="mr-1 inline" size={17} /> Next ad in {cooldownLeft}s</div>}

        {state === "claimable" || state === "claiming" ? (
          <button disabled={state !== "claimable"} onClick={() => void handleClaim()} className="mt-5 inline-flex w-full animate-pulse items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300">{state === "claiming" ? "Claiming..." : `Claim ${task.coins_reward} Coins`}</button>
        ) : (
          <button disabled={isBusy} onClick={handleWatchAd} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"><ExternalLink size={16} /> {state === "daily_limit_reached" ? "Daily limit reached" : state === "watching" ? "Watching..." : state === "cooldown" ? `Next ad in ${cooldownLeft}s` : "Watch Ad"}</button>
        )}
      </div>
    </article>
  );
}
