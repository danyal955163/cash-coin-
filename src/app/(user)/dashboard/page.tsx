import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/SignOutButton";

const cards = [
  { title: "Deposit Wallet", value: "Coming soon", description: "Your deposit balance will appear here." },
  { title: "Withdrawal Wallet", value: "Coming soon", description: "Your withdrawal balance will appear here." },
  { title: "Coins", value: "0", description: "Complete tasks to earn coins." },
  { title: "Package", value: "No package", description: "Package details will appear here." },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <span className="text-2xl font-bold tracking-tight text-emerald-600">CashCoin</span>
          <SignOutButton />
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            Welcome, {user.email ?? "CashCoin member"}
          </h1>
          <p className="mt-2 text-gray-600">Your username: {profile?.username ?? "Not set yet"}</p>
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
      </section>
    </main>
  );
}
