"use client";

import { useEffect, useRef, useState } from "react";
import { socialProofActivities, type SocialProofActivity } from "@/data/social-proof-data";

const borderColors = ["border-emerald-500", "border-blue-500", "border-amber-500", "border-pink-500", "border-purple-500", "border-indigo-500"];
const iconByAction = { withdrawal: "💸", deposit: "💰", earning: "🎉" } as const;
const actionText = { withdrawal: "withdrew", deposit: "deposited", earning: "earned" } as const;

export default function LiveActivityNotification() {
  const [current, setCurrent] = useState<SocialProofActivity | null>(null);
  const [visible, setVisible] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const indexRef = useRef(-1);

  useEffect(() => {
    const clearTimers = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (hideRef.current) window.clearTimeout(hideRef.current);
      timerRef.current = null;
      hideRef.current = null;
    };
    const showNext = () => {
      if (document.hidden) return;
      let next = Math.floor(Math.random() * socialProofActivities.length);
      if (socialProofActivities.length > 1 && next === indexRef.current) next = (next + 1) % socialProofActivities.length;
      indexRef.current = next;
      setCurrent(socialProofActivities[next]);
      setColorIndex((value) => (value + 1) % borderColors.length);
      setVisible(true);
      hideRef.current = window.setTimeout(() => setVisible(false), 4000);
      timerRef.current = window.setTimeout(showNext, 6000 + Math.random() * 1500);
    };
    const handleVisibility = () => {
      clearTimers();
      if (document.hidden) setVisible(false);
      else timerRef.current = window.setTimeout(showNext, 700);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    timerRef.current = window.setTimeout(showNext, 1500);
    return () => { clearTimers(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

  if (!current || !visible) return null;
  return <div className={`fixed left-2 right-2 top-2 z-50 md:left-auto md:right-4 md:w-96 ${borderColors[colorIndex]} animate-slide-down-in`} role="status" aria-live="polite"><div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-2xl"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 font-bold text-white">{current.name[0]}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-900">{current.name}</p><p className="text-xs text-gray-600"><span className="mr-1 text-base">{iconByAction[current.action]}</span> just {actionText[current.action]} <span className="font-bold text-emerald-600">{current.amount} PKR</span>{current.action !== "earning" && <span> to <span className="font-mono">{current.maskedNumber}</span></span>}</p><p className="mt-0.5 text-[10px] text-gray-400">• {current.timeAgo} · {current.accountType}</p></div></div></div>;
}
