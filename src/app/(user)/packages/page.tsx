import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages - CashCoin Earning Plans",
  description: "Compare CashCoin earning packages in Pakistan, including 15-day plans with daily tasks and higher online earning potential.",
};

import PackageCard from "@/components/packages/PackageCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PackagesPage() { const { data: packages, error } = await createClient().from("packages_settings").select("*").order("display_order", { ascending: true }); if (error) console.error("Packages fetch error:", error); return <section className="mx-auto max-w-6xl space-y-7"><div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6 shadow-sm ring-1 ring-amber-100 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Packages</p><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Choose your earning package</h1><p className="mt-3 text-sm leading-6 text-slate-600">Select a package to unlock daily tasks and start earning coins.</p></div>{packages?.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}</div> : <p className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500 ring-1 ring-slate-200">No packages are currently available.</p>}</section>; }
