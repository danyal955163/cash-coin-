import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - CashCoin Earning App",
  description: "Login to CashCoin and continue earning money online. Track your earnings and withdraw via JazzCash.",
};

import LoginForm from "@/components/auth/LoginForm";
import LiveActivityNotification from "@/components/social-proof/LiveActivityNotification";

export default function LoginPage() {
  return <><LiveActivityNotification /><div className="mb-4 rounded-2xl bg-white/85 px-4 py-3 text-center text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">Welcome back to your CashCoin account.</div><LoginForm /></>;
}
