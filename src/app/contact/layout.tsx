import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - CashCoin Support",
  description: "Contact CashCoin support for help with your account, tasks, packages, and JazzCash or EasyPaisa withdrawals.",
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
