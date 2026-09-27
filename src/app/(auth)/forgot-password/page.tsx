"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Password reset functionality is coming soon.");
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="mt-2 text-sm text-gray-600">Enter your email and we&apos;ll help you reset your password.</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        <button className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700" type="submit">
          Send Reset Link
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password? <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Login</Link>
      </p>
    </div>
  );
}
