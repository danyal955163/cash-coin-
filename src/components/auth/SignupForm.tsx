"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { applyReferral, signUp } from "@/lib/auth";

export default function SignupForm({ initialReferralCode = "" }: { initialReferralCode?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signUp(email.trim(), password);
      if (error) {
        toast.error(error.message);
        return;
      }

      if (referralCode.trim() && data.user) {
        const referralResult = await applyReferral(data.user.id, referralCode);
        if (referralResult.error) {
          toast.error("Account created, but the referral reward could not be applied.");
        }
      }

      if (data.session) {
        toast.success("Account created successfully!");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(true);
      toast.success("Account created! Check your email to confirm.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Unable to create your account. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-fade-in-up rounded-3xl bg-white p-8 shadow-xl shadow-emerald-100 ring-1 ring-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">Start earning with CashCoin today.</p>
      </div>
      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700" role="status">
          Account created! Check your email to confirm.
        </div>
      )}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
          <input className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" type="password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Referral Code <span className="font-normal text-gray-400">(optional)</span>
          <input className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" type="text" value={referralCode} onChange={(event) => setReferralCode(event.target.value)} />
        </label>
        <button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
          {isLoading ? "⏳ Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have account? <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Login</Link>
      </p>
    </div>
  );
}
