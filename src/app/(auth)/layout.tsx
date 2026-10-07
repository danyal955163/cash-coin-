import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="relative z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-emerald-800"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-amber-300"><ShieldCheck size={22} /></span>CashCoin</Link>
          <div className="flex items-center gap-3"><Link href="/" className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-700 sm:inline-flex"><ArrowLeft size={16} /> Back to home</Link><LanguageSwitcher /></div>
        </div>
      </header>
      <div className="relative isolate flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_20%,rgba(16,185,129,0.13),transparent_42%),radial-gradient(ellipse_at_85%_85%,rgba(168,85,247,0.09),transparent_42%)]" />
        <div className="w-full max-w-md"><div className="mb-7 text-center"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100"><ShieldCheck size={14} /> Secure member access</span><p className="mt-4 text-sm text-slate-500">Your earning journey starts here.</p></div>{children}<p className="mt-6 text-center text-xs text-slate-500">CashCoin · Earn with confidence</p></div>
      </div>
    </main>
  );
}
