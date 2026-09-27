import DepositForm from "@/components/deposit/DepositForm";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

function settingText(value: Json | undefined) {
  if (value === undefined || value === null) return "Not configured";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

export default async function DepositPage({ searchParams }: { searchParams: { package?: string } }) {
  const packageName = searchParams.package ?? "";
  const amountMatch = packageName.match(/(\d+(?:\.\d+)?)/);
  const amount = Number(amountMatch?.[1] ?? 0);
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["jazzcash_number", "easypaisa_number", "bank_account"]);
  const settingMap = Object.fromEntries((settings ?? []).map((setting) => [setting.key, setting.value]));

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Deposit</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">Complete your package payment</h1>
        <p className="mt-3 text-gray-600">Send {amount || "the selected amount"} PKR to one of these accounts.</p>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"><p className="text-sm font-semibold text-gray-500">JazzCash</p><p className="mt-2 break-words font-bold text-gray-900">{settingText(settingMap.jazzcash_number)}</p></div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"><p className="text-sm font-semibold text-gray-500">EasyPaisa</p><p className="mt-2 break-words font-bold text-gray-900">{settingText(settingMap.easypaisa_number)}</p></div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"><p className="text-sm font-semibold text-gray-500">Bank Account</p><p className="mt-2 break-words font-bold text-gray-900">{settingText(settingMap.bank_account)}</p></div>
      </div>
      <DepositForm amount={amount} packageName={packageName} />
    </section>
  );
}
