"use client";

import { Check, Clock3, ExternalLink, Gift, RotateCcw } from "lucide-react";

type Task = {
  title: string;
  description: string | null;
  image_url: string | null;
  coins_reward: number;
  task_type: "one_time" | "repeated" | "ad" | "monetag_ad" | "social_share";
  requires_game_id?: boolean;
};

export default function CompactTaskCard({
  task,
  onClick,
  userStatus,
}: {
  task: Task;
  onClick: () => void;
  userStatus?: "available" | "pending" | "approved" | "rejected";
}) {
  const type = task.task_type === "social_share"
    ? { label: "↗ Share Task", color: "bg-violet-500" }
    : task.task_type === "repeated"
    ? { label: "↻ Repeated", color: "bg-emerald-500" }
    : { label: "1× One-Time", color: "bg-blue-500" };

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:shadow-lg">
      <div className="relative h-52 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 sm:h-60">
        {task.image_url ? (
          <img src={task.image_url} alt={task.title} className="h-full w-full object-cover" />
        ) : (
          <Gift className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80" size={64} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-sm ${type.color}`}>
          {type.label}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-black text-slate-950 shadow-sm">
          +{task.coins_reward} coins
        </span>
        {task.requires_game_id && (
          <span className="absolute bottom-3 left-3 rounded-full bg-purple-700/90 px-3 py-1 text-xs font-bold text-white">
            New account task
          </span>
        )}
        {userStatus === "pending" && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
            <Clock3 size={13} /> Pending
          </span>
        )}
        {userStatus === "approved" && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
            <Check size={13} /> Approved
          </span>
        )}
        {userStatus === "rejected" && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            <RotateCcw size={13} /> Resubmit
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-base font-black text-slate-900 sm:text-lg">{task.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {task.description ?? "Complete this task to earn coins."}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <ExternalLink size={15} /> Open Task
          </button>
          <button
            type="button"
            onClick={onClick}
            className="min-h-11 flex-1 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            Submit Proof
          </button>
        </div>
      </div>
    </article>
  );
}
