import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - CashCoin Earning App",
  description: "Login to CashCoin and continue earning money online. Track your earnings and withdraw via JazzCash.",
};

import LoginForm from "@/components/auth/LoginForm";
import LiveActivityNotification from "@/components/social-proof/LiveActivityNotification";

export default function LoginPage() {
  return <><LiveActivityNotification /><LoginForm /></>;
}
