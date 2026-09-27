"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ReferralLink({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://cash-coin-nine.vercel.app/signup?ref=${encodeURIComponent(username)}`;

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the referral link.");
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Your Referral Link</h2>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 outline-none" value={referralLink} readOnly aria-label="Your referral link" />
        <button type="button" onClick={copyReferralLink} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}
