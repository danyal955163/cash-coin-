import Link from "next/link";
import { Sparkles } from "lucide-react";

import SignOutButton from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Link href="/dashboard" className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-200"><Sparkles size={18} /></span><span>Cash<span className="text-emerald-500">Coin</span></span></Link><div className="flex items-center gap-3"><span className="hidden max-w-44 truncate text-xs font-medium text-slate-500 sm:block">{user?.email ?? ""}</span><SignOutButton /></div></div></header>;
}
