"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

const links = [
  ["Dashboard", "/admin"],
  ["Deposits", "/admin/deposits"],
  ["Tasks", "/admin/tasks"],
  ["Task History", "/admin/task-history"],
  ["Broadcast", "/admin/broadcast"],
  ["Withdrawals", "/admin/withdrawals"],
  ["Users", "/admin/users"],
  ["Packages Settings", "/admin/packages-settings"],
  ["Site Settings", "/admin/settings"],
  ["Support Tickets", "/admin/support"],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {open && <button type="button" className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(85vw,280px)] flex-col overflow-y-auto bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 px-5 py-6 text-white shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 px-2">
          <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-amber-300 ring-1 ring-white/20"><ShieldCheck size={23} /></span>
            <span><span className="block text-lg font-black tracking-tight">CashCoin</span><span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200/75">Admin workspace</span></span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl text-emerald-100 hover:bg-white/10 lg:hidden" aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="my-7 h-px bg-white/10" />
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/65">Workspace</p>
        <nav aria-label="Admin navigation" className="space-y-1.5">
          {links.map(([label, href]) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-emerald-400/20 text-white ring-1 ring-emerald-300/30" : "text-emerald-100/75 hover:bg-white/10 hover:text-white"}`}>{label}</Link>;
          })}
        </nav>
        <div className="mt-auto px-3 pt-8 text-xs leading-5 text-emerald-200/65">Manage your community with confidence.</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-100 lg:hidden" aria-label="Open menu" aria-expanded={open}><Menu size={20} /></button>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">CashCoin control center</p><p className="text-sm font-bold text-slate-900 sm:text-base">Admin workspace</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4"><span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:inline-flex">Administrator</span><SignOutButton /></div>
        </header>
        <main className="w-full min-w-0 flex-1 px-4 py-7 text-slate-900 sm:px-7 lg:px-10 lg:py-10"><div className="mx-auto max-w-7xl">{children}</div></main>
      </div>
    </div>
  );
}
