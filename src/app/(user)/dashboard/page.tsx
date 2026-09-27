import Link from "next/link";
import { redirect } from "next/navigation";

import ReferralLink from "@/components/dashboard/ReferralLink";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, deposit_wallet, withdrawal_wallet, coins, package_name, package_expires_at, referral_code")
    .eq("id", user.id)
    .maybeSingle();

  const expiryDate = profile?.package_expires_at
    ? new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date(profile.package_expires_at))
    : null;
  const username = profile?.username ?? "";
  const cards = [
    { title: "Deposit Wallet", value: `${profile?.deposit_wallet ?? 0} PKR`, description: "Available deposit balance." },
    { title: "Withdrawal Wallet", value: `${profile?.withdrawal_wallet ?? 0} PKR`, description: "Available withdrawal balance." },
    { title: "Coins", value: String(profile?.coins ?? 0), description: "Your earned coins." },
    { title: "Package", value: profile?.package_name ?? "No package", description: expiryDate ? `Expires: ${expiryDate}` : "No expiry date set." },
  ];

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">Welcome, {user.email ?? "CashCoin member"}</h1>
          <p className="mt-2 text-gray-600">Your username: {username || "Not set yet"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/packages" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Buy Package</Link>
          <Link href="/deposit" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-600 hover:text-emerald-600">Deposit</Link>
          <Link href="/tasks" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-600 hover:text-emerald-600">View Tasks</Link>
          <Link href="/wallet" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-600 hover:text-emerald-600">View Wallet</Link>
          <Link href="/withdrawal" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-600 hover:text-emerald-600">Withdraw</Link>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-semibold text-gray-600">{card.title}</h2>
            <p className="mt-4 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
          </article>
        ))}
      </div>
      <ReferralLink username={username} />
    </section>
  );
}
