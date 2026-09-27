"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { signIn } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Unable to log in. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">Log in to continue earning with CashCoin.</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
        </label>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Forgot Password?
          </Link>
        </div>
        <button className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have account? <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">Sign Up</Link>
      </p>
    </div>
  );
}
