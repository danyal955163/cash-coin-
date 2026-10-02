"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ value, label }: { value: string; label: string }) { const [copied, setCopied] = useState(false); const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }; return <button type="button" onClick={() => void copy()} aria-label={`Copy ${label}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-emerald-100 hover:text-emerald-700">{copied ? <Check size={16} /> : <Copy size={16} />}</button>; }
