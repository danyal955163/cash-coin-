"use client";

import { Check, Clock3, Gift, RotateCcw } from "lucide-react";

type Task = { title: string; image_url: string | null; coins_reward: number; task_type: "one_time" | "repeated" | "ad"; requires_game_id?: boolean };
export default function CompactTaskCard({ task, onClick, userStatus }: { task: Task; onClick: () => void; userStatus?: "available" | "pending" | "approved" | "rejected" }) {
  const type = task.task_type === "ad" ? { label: "AD", color: "bg-orange-500" } : task.task_type === "repeated" ? { label: "↻", color: "bg-green-500" } : { label: "1×", color: "bg-blue-500" };
  return <button type="button" onClick={onClick} aria-label={`Start ${task.title}`} className="group relative aspect-square min-w-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-left shadow-sm ring-1 ring-slate-200 transition hover:scale-[1.02]">
    {task.image_url ? <img src={task.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <Gift className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80" size={34} />}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
    <span className={`absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[8px] font-black text-white ${type.color}`}>{type.label}</span>
    {task.requires_game_id ? <span className="absolute right-1 top-1 rounded-full bg-purple-600 px-1.5 py-0.5 text-[9px] text-white">🎮</span> : userStatus === "pending" ? <span className="absolute right-1 top-1 rounded-full bg-yellow-500 px-1.5 py-0.5 text-[9px] text-white"><Clock3 size={10} /></span> : userStatus === "approved" ? <span className="absolute right-1 top-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] text-white"><Check size={10} /></span> : userStatus === "rejected" ? <span className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] text-white"><RotateCcw size={10} /></span> : null}
    <div className="absolute bottom-0 left-0 right-0 p-2"><p className="truncate text-xs font-black text-yellow-300">+{task.coins_reward}</p><p className="line-clamp-2 text-[10px] font-bold leading-3 text-white">{task.title}</p></div>
  </button>;
}
