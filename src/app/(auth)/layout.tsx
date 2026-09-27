import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-5 py-12"><div className="pointer-events-none absolute left-8 top-16 text-5xl opacity-10">🪙</div><div className="pointer-events-none absolute bottom-20 right-10 text-6xl opacity-10">💰</div><div className="relative z-10 w-full max-w-md"><Link href="/" className="animate-fade-in-up mb-8 flex items-center justify-center gap-2 text-4xl font-black tracking-tight text-transparent [background:linear-gradient(90deg,#10b981,#2563eb)_text]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 text-white shadow-lg shadow-emerald-200"><Sparkles size={22} /></span>CashCoin</Link>{children}</div></main>;
}
