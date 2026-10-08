"use client";

import { Link2, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { REFERRAL_LIFETIME_PERCENT, REFERRAL_SIGNUP_BONUS_PKR } from "@/lib/constants";

export default function ReferralLink({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = username ? `${baseUrl}/${encodeURIComponent(username)}` : baseUrl;
  const message = `Join CashCoin and earn rewards! Sign up here: ${referralLink}`;

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Referral message copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the referral message.");
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 p-6 text-white shadow-xl shadow-fuchsia-200">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/80">
        <Sparkles size={17} /> Referral rewards
      </div>
      <h2 className="mt-3 text-2xl font-black">Your Referral Link</h2>
      <p className="mt-2 text-sm font-semibold text-white/90">
        Invite 1 person → Earn Rs.{REFERRAL_SIGNUP_BONUS_PKR} + Lifetime {REFERRAL_LIFETIME_PERCENT}%
      </p>
      <p className="mt-2 text-sm leading-6 text-white/90">Share this link on WhatsApp, Facebook, or Telegram.</p>
      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-700">
          <Link2 size={16} className="shrink-0 text-fuchsia-500" />
          <span className="truncate">{referralLink}</span>
        </div>
        <button
          type="button"
          onClick={copyReferralLink}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-emerald-400"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}
