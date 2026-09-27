import PackageCard, { type PackageCardData } from "@/components/packages/PackageCard";
import { createClient } from "@/lib/supabase/server";

const fallbackPackages: PackageCardData[] = [
  { id: "free", name: "Free", price: 0, daily_tasks: 1, per_task_coins: 10, duration: "7 days", description: "Try CashCoin with a starter package." },
  { id: "200", name: "200 PKR Package", price: 200, daily_tasks: 5, per_task_coins: 20, duration: "30 days", description: "A simple package to start earning more." },
  { id: "300", name: "300 PKR Package", price: 300, daily_tasks: 8, per_task_coins: 25, duration: "30 days", description: "Build your daily earning routine." },
  { id: "400", name: "400 PKR Package", price: 400, daily_tasks: 12, per_task_coins: 30, duration: "30 days", description: "Unlock more tasks and higher rewards." },
  { id: "500", name: "500 PKR Package", price: 500, daily_tasks: 16, per_task_coins: 40, duration: "30 days", description: "Our highest base package for active earners." },
];

export default async function PackagesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("packages_settings")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  const packages: PackageCardData[] = data?.length ? data : fallbackPackages;

  return (
    <section>
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Packages</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">Choose your earning package</h1>
        <p className="mt-3 max-w-2xl text-gray-600">Select a package to unlock daily tasks and start earning coins.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {packages.slice(0, 5).map((packageData) => <PackageCard key={packageData.id} package={packageData} />)}
      </div>
    </section>
  );
}
