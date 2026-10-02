"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, Home, Settings, Sparkles, User, Wallet } from "lucide-react";

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = [{ label: "Dashboard", href: "/dashboard", color: "text-emerald-500", icon: Home }, { label: "Tasks", href: "/tasks", color: "text-purple-500", icon: CheckCircle }, { label: "Free Tasks", href: "/free-tasks", color: "text-orange-500", icon: Sparkles }, { label: "Wallet", href: "/wallet", color: "text-pink-500", icon: Wallet }, { label: "Profile", href: "/profile", color: "text-indigo-500", icon: User }, ...(isAdmin ? [{ label: "Admin", href: "/admin", color: "text-slate-600", icon: Settings }] : [])] as const;
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur"><div className="mx-auto flex h-16 max-w-3xl items-stretch overflow-x-auto px-1"><div className="flex min-w-full flex-1">{items.map(({ label, href, color, icon: Icon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} className={`relative flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1 text-center text-[10px] transition ${active ? `${color} font-black` : "font-semibold text-slate-400"}`}><Icon size={20} strokeWidth={active ? 2.7 : 2} /><span className="truncate">{label}</span>{active && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${color.replace("text-", "bg-")}`} />}</Link>; })}</div></div></nav>;
}
