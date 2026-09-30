"use client";

import { CheckCircle, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props { open: boolean; onClose: () => void; onComplete: () => void; title?: string }
const AD_SECONDS = 10;

export default function MonetagAdGate({ open, onClose, onComplete, title = "Watch Ad to Continue" }: Props) {
  const [countdown, setCountdown] = useState(AD_SECONDS);
  const [adOpened, setAdOpened] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const clearTimer = () => { if (intervalRef.current !== null) { window.clearInterval(intervalRef.current); intervalRef.current = null; } };
  useEffect(() => { if (!open) { clearTimer(); setCountdown(AD_SECONDS); setAdOpened(false); setIsComplete(false); } return clearTimer; }, [open]);
  const handleOpenAd = () => { const url = process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK || "https://omg10.com/4/11925164"; window.open(url, "_blank", "noopener,noreferrer"); setAdOpened(true); setCountdown(AD_SECONDS); clearTimer(); intervalRef.current = window.setInterval(() => setCountdown((value) => { if (value <= 1) { clearTimer(); setIsComplete(true); return 0; } return value - 1; }), 1000); };
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">{title}</h3><button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700"><X size={22} /></button></div><div className="py-5 text-center">{!adOpened ? <><Play className="mx-auto mb-3 h-12 w-12 rounded-full bg-purple-100 p-3 text-purple-600" /><p className="mb-4 text-sm text-slate-600">Watch a short 10-second ad to unlock this feature.</p><button type="button" onClick={handleOpenAd} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-700">Open Ad in New Tab</button></> : !isComplete ? <><div className="mb-2 text-6xl font-black text-purple-600">{countdown}</div><p className="text-sm text-slate-600">Watching ad... please wait</p></> : <><CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" /><p className="mb-4 text-sm text-slate-600">Ad watched! Click below to continue.</p><button type="button" onClick={() => { onComplete(); onClose(); }} className="w-full animate-pulse rounded-lg bg-green-500 py-3 font-bold text-white hover:bg-green-600">Continue →</button></>}</div><p className="mt-3 text-center text-[10px] text-slate-400">Ad must be watched for 10 seconds minimum.</p><button type="button" onClick={onClose} className="mt-3 w-full text-xs font-semibold text-slate-400 hover:text-slate-600">Cancel</button></div></div>;
}
