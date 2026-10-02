import { createClient } from "@/lib/supabase/server";
import NavbarClient from "@/components/layout/NavbarClient";

export default async function Navbar() {
  const { data: { user } } = await createClient().auth.getUser();
  const email = user?.email ?? "";
  const isAdmin = email.toLowerCase() === "muhammaddanyal4949@gmail.com";
  return <NavbarClient email={email} isAdmin={isAdmin} userId={user?.id ?? null} />;
}
