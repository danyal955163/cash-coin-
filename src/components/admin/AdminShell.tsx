"use client";

import Link from "next/link";
import { useState } from "react";

import SignOutButton from "@/components/auth/SignOutButton";

const links = [
  ["Dashboard", "/admin"],
  ["Deposits", "/admin/deposits"],
  ["Tasks", "/admin/tasks"],
  ["Withdrawals", "/admin/withdrawals"],
  ["Packages Settings", "/admin/packages-settings"],
  ["Site Settings", "/admin/settings"],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 px-5 py-6 text-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between"><Link href="/admin" className="text-2xl font-bold text-emerald-400">CashCoin</Link><button onClick={() => setOpen(false)} className="text-gray-400 lg:hidden" aria-label="Close menu">×</button></div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Admin Panel</p>
        <nav className="mt-8 space-y-1">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white">{label}</Link>)}</nav>
      </aside>
      {open && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <button onClick={() => setOpen(true)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 lg:hidden" aria-label="Open menu">☰</button>
          <div className="ml-auto flex items-center gap-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Admin</span><SignOutButton /></div>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
