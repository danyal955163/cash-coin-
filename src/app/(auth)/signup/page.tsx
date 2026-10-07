import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Free - CashCoin Online Earning App",
  description: "Create your free CashCoin account in 30 seconds. No investment needed. Start earning money online via JazzCash.",
};

import SignupForm from "@/components/auth/SignupForm";
import LiveActivityNotification from "@/components/social-proof/LiveActivityNotification";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return <><LiveActivityNotification /><div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-900 ring-1 ring-amber-200">Create an account and make your first move.</div><SignupForm initialReferralCode={searchParams.ref ?? ""} /></>;
}
