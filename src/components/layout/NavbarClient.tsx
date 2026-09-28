"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleHelp, Menu, X } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

const pages = [
  ["Dashboard", "/dashboard"],
  ["Tasks", "/tasks"],
  ["Wallet", "/wallet"],
  ["Withdrawal", "/withdrawal"],
  ["Packages", "/packages"],
  ["Deposit", "/deposit"],
  ["Team", "/referral"],
  ["Profile", "/profile"],
  ["Help", "/help"],
  ["TimeWall", "/timewall"],
] as const;

export default function NavbarClient({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const navPages = isAdmin ? [...pages, ["Admin Panel", "/admin"] as const] : pages;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation menu" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600">
              <Menu size={23} />
            </button>
            <Link href="/dashboard" className="min-w-0 text-xl font-black tracking-tight text-emerald-500">Cash<span className="text-slate-900">Coin</span></Link>
          </div>
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <Link href="/help" aria-label="Help & Support" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-gray-600 transition hover:text-emerald-600"><CircleHelp size={21} /></Link>
            <span className="hidden max-w-44 truncate text-xs font-medium text-slate-500 sm:block">{email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <button type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-900/40" />
        <aside className="relative flex h-full w-[min(84vw,320px)] flex-col bg-white shadow-2xl">
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xl font-black tracking-tight text-emerald-500">Cash<span className="text-slate-900">Coin</span></Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu" className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={22} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            {navPages.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">{label}</Link>)}
          </nav>
        </aside>
      </div>}
    </>
  );
}
