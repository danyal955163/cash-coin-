import { redirect } from "next/navigation";
import HelpCenter from "@/components/support/HelpCenter";
import { createClient } from "@/lib/supabase/server";
export default async function HelpPage() { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); return <HelpCenter userId={user.id} email={user.email ?? ""} />; }
