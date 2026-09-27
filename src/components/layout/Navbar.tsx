import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";

const links = [
  ["Dashboard", "/dashboard"],
  ["Packages", "/packages"],
  ["Tasks", "/tasks"],
  ["Wallet", "/wallet"],
  ["Profile", "/profile"],
] as const;

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4 lg:px-8">
        <Link href="/dashboard" className="mr-4 text-2xl font-bold tracking-tight text-emerald-600">CashCoin</Link>
        <nav className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-600">
          {links.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-emerald-600">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-48 truncate text-sm text-gray-500 sm:block">{user?.email ?? ""}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
