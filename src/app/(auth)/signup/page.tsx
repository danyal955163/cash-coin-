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
  return <><LiveActivityNotification /><SignupForm initialReferralCode={searchParams.ref ?? ""} /></>;
}
