"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, CircleHelp, Home, Settings, UserRound, UsersRound, WalletCards } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", color: "text-emerald-500", icon: Home },
  { label: "Tasks", href: "/tasks", color: "text-blue-500", icon: CheckCircle2 },
  { label: "Wallet", href: "/wallet", color: "text-amber-500", icon: WalletCards },
  { label: "Profile", href: "/profile", color: "text-purple-500", icon: UserRound },
  { label: "Team", href: "/referral", color: "text-fuchsia-500", icon: UsersRound },
  { label: "Help", href: "/help", color: "text-cyan-500", icon: CircleHelp },
];

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...items, { label: "Admin", href: "/admin", color: "text-slate-600", icon: Settings }] : items;
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur"><div className="mx-auto flex h-16 max-w-2xl items-stretch justify-around px-1">{links.map(({ label, href, color, icon: Icon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition ${active ? color : "text-slate-400"}`}><Icon size={20} strokeWidth={active ? 2.5 : 2} /><span>{label}</span>{active && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${color.replace("text-", "bg-")}`} />}</Link>; })}</div></nav>;
}
