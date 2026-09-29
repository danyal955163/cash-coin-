import { redirect } from "next/navigation";
import SupportChat from "@/components/support/SupportChat";
import { createClient } from "@/lib/supabase/server";
export default async function HelpPage() { const { data: { user } } = await createClient().auth.getUser(); if (!user) redirect("/login"); return <SupportChat userId={user.id} />; }
