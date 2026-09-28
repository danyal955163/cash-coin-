"use client";

import { CheckCircle2, Clock3, ExternalLink, LockKeyhole, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskSubmitModal from "@/components/tasks/TaskSubmitModal";
import AdTaskCard from "@/components/tasks/AdTaskCard";
import TimeWallTaskCard from "@/components/tasks/TimeWallTaskCard";

type Task = { id: string; title: string; description: string | null; image_url: string | null; task_link: string | null; ad_url: string | null; coins_reward: number; task_type: "one_time" | "repeated" | "ad" | "timewall"; ad_duration_seconds: number | null; cooldown_seconds: number | null; ad_daily_limit: number; ad_completed_today: number; cooldown_minutes: number; last_submission_at: string | null; timewall_placement_id: string | null };

function DailyResetCard({ resetHour }: { resetHour: number }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(0);
  const [resetAt, setResetAt] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(Math.min(23, Math.max(0, resetHour)), 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    setResetAt(next);
    const update = () => {
      const difference = Math.max(0, next.getTime() - Date.now());
      setRemaining(Math.floor(difference / 1000));
      if (difference <= 0) router.refresh();
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [resetHour, router]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const timeLabel = resetAt?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) ?? "12:00 AM";
  return <div className="mb-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 text-center text-white shadow-xl shadow-indigo-200"><Clock3 className="mx-auto animate-pulse text-indigo-100" size={32} /><p className="mt-3 text-sm font-black uppercase tracking-widest text-indigo-100">Daily limit reached!</p><p className="mt-2 text-sm font-semibold text-white/80">New tasks available in:</p><p className="mt-2 font-mono text-3xl font-black tracking-wider sm:text-4xl">{String(hours).padStart(2, "0")} : {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}</p><p className="mt-3 text-xs font-semibold text-white/75">Resets daily at {timeLabel}</p><p className="mt-1 text-xs text-white/60">The task list will refresh automatically when the reset time arrives.</p></div>;
}

export default function TasksList({ tasks, userId, username, completedCount, dailyLimit, dailyResetHour = 0 }: { tasks: Task[]; userId: string; username: string; completedCount: number; dailyLimit: number; dailyResetHour?: number }) {
  const [selected, setSelected] = useState<Task | null>(null);
  const router = useRouter();
  const limitReached = completedCount >= dailyLimit;
  const showResetCountdown = limitReached || tasks.length === 0;
  return <div>
    {showResetCountdown && <DailyResetCard resetHour={dailyResetHour} />}
    <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-100"><div className="flex justify-between text-sm font-bold"><span>Today&apos;s Progress</span><span>{completedCount} / {dailyLimit} tasks completed</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.min(100, completedCount / Math.max(1, dailyLimit) * 100)}%` }} /></div></div>
    {tasks.length ? <div className="grid gap-5 md:grid-cols-2">{tasks.map((task, index) => { const cooldownMs = task.cooldown_minutes * 60000; const remainingMinutes = task.task_type === "repeated" && task.last_submission_at && cooldownMs > 0 ? Math.ceil((new Date(task.last_submission_at).getTime() + cooldownMs - Date.now()) / 60000) : 0; const cooldownActive = remainingMinutes > 0; if (task.task_type === "ad") return <AdTaskCard key={task.id} task={task} userId={userId} disabled={limitReached || task.ad_completed_today >= task.ad_daily_limit} />; if (task.task_type === "timewall") return <TimeWallTaskCard key={task.id} task={task} username={username} />; const badge = task.task_type === "repeated" ? "Repeated" : "One-Time"; return <article key={task.id} style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-in-up overflow-hidden rounded-2xl border-l-4 border-blue-500 bg-white shadow-sm ring-1 ring-slate-200">{task.image_url && <img src={task.image_url} alt="" className="h-36 w-full object-cover" />}<div className="p-5"><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${task.task_type === "repeated" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{badge}</span><h2 className="mt-3 font-black text-slate-900">{task.title}</h2></div><span className="whitespace-nowrap rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-700">+{task.coins_reward}</span></div><p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{task.description ?? "Complete this task and submit proof for review."}</p>{limitReached && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500"><LockKeyhole size={14} /> Daily limit reached. See reset timer above.</p>}{cooldownActive && <p className="mt-3 text-xs font-bold text-amber-600">Next in {remainingMinutes} min</p>}<div className="mt-5 flex flex-wrap gap-2">{task.task_link && <a href={task.task_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600"><ExternalLink size={14} /> Open Task</a>}<button disabled={limitReached || cooldownActive} onClick={() => setSelected(task)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"><Send size={14} /> Submit Proof</button></div></div></article>; })}</div> : <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><CheckCircle2 className="mx-auto text-emerald-500" size={42} /><p className="mt-4 font-semibold text-slate-700">No tasks are currently available. New tasks will appear after the daily reset.</p></div>}
    {selected && <TaskSubmitModal task={selected} userId={userId} onClose={() => setSelected(null)} onSubmitted={() => { setSelected(null); router.refresh(); }} />}
  </div>;
}
