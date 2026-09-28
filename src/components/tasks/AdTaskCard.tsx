"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Clock3, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
type AdTask = { id: string; title: string; description: string | null; image_url: string | null; task_link: string | null; coins_reward: number; ad_duration_seconds: number | null };
export default function AdTaskCard({ task, disabled }: { task: AdTask; disabled: boolean }) {
  const duration = task.ad_duration_seconds ?? 15;
  const [remaining, setRemaining] = useState(0);
  const [isPending, startTransition] = useTransition();
  const started = useRef(false);
  const watching = remaining > 0 || isPending;
  useEffect(() => { if (!remaining) return; const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [remaining]);
  useEffect(() => { if (remaining !== 0 || !started.current) return; started.current = false; startTransition(() => { void (async () => { const { error } = await createClient().rpc("complete_ad_task", { p_task_id: task.id }); if (error) toast.error(error.message); else { toast.success(`${task.coins_reward} coins earned!`); window.location.reload(); } })(); }); }, [remaining, startTransition, task.coins_reward, task.id]);
  function watch() { if (disabled || watching) return; if (task.task_link) window.open(task.task_link, "_blank", "noopener,noreferrer"); started.current = true; setRemaining(duration); }
  return <article className="overflow-hidden rounded-2xl border-l-4 border-orange-500 bg-white shadow-sm ring-1 ring-slate-200">{task.image_url && <img src={task.image_url} alt="" className="h-36 w-full object-cover" />}<div className="p-5"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">Ad - {duration}s</span><h2 className="mt-3 font-black text-slate-900">{task.title}</h2></div><span className="whitespace-nowrap rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-700">+{task.coins_reward}</span></div><p className="mt-3 text-sm leading-6 text-slate-500">{task.description ?? "Watch this ad to earn coins automatically."}</p>{watching && <div className="mt-4 rounded-xl bg-orange-50 p-3 text-center text-sm font-bold text-orange-700"><Clock3 className="mr-1 inline" size={16} /> Watching... {remaining}s remaining<div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full bg-orange-500 transition-all" style={{ width: `${((duration - remaining) / duration) * 100}%` }} /></div></div>}<button disabled={disabled || watching} onClick={watch} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-3 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"><ExternalLink size={15} /> {disabled ? "Daily limit reached" : watching ? "Watching..." : `Watch Ad (${duration}s)`}</button></div></article>;
}
