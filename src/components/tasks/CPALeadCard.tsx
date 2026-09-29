"use client";

import { Gift, Sparkles } from "lucide-react";

const CPALEAD_URL = "https://www.mobtrk.link/wall/yIX90hTi";

export default function CPALeadCard({ username }: { username: string }) {
  function openOffers() {
    const subid = encodeURIComponent(username || "unknown");
    window.open(`${CPALEAD_URL}?subid=${subid}`, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-xl shadow-emerald-200">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
          <Gift size={32} className="text-white" />
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Instant Rewards</span>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <Sparkles size={18} className="text-yellow-200" />
        <h2 className="text-2xl font-black">CPALead Offers</h2>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">Complete surveys and offers to earn extra coins. New offers daily!</p>
      <button type="button" onClick={openOffers} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-emerald-700 shadow-lg transition hover:bg-emerald-50 sm:w-auto">Open CPALead Offers <span className="ml-2 text-lg">→</span></button>
      <p className="mt-4 text-xs font-semibold text-white/75">Coins will be credited automatically after offer completion.</p>
    </article>
  );
}
