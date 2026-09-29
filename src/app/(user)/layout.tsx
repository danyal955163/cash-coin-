import BottomNav from "@/components/layout/BottomNav";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email?.toLowerCase() === "muhammaddanyal4949@gmail.com";
  return <div className="flex min-h-screen flex-col bg-slate-50"><Navbar /><main className="flex-1 pb-24"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div></main><BottomNav isAdmin={isAdmin} /></div>;
}
