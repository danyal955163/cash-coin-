import PackageCard from "@/components/packages/PackageCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PackagesPage() { const { data: packages, error } = await createClient().from("packages_settings").select("*").order("display_order", { ascending: true }); if (error) console.error("Packages fetch error:", error); return <section className="mx-auto max-w-5xl px-3"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Packages</p><h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Choose your earning package</h1><p className="mt-2 text-sm text-gray-600">Select a package to unlock daily tasks and start earning coins.</p></div>{packages?.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-4">{packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}</div> : <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">No packages are currently available.</p>}</section>; }
