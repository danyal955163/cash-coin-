import TimewallTransactions from "@/components/admin/TimewallTransactions";
import { createClient } from "@/lib/supabase/server";
export default async function AdminTimewallPage() { const { data, error } = await createClient().from("timewall_transactions").select("*").order("created_at", { ascending: false }); return <TimewallTransactions transactions={error ? [] : data ?? []} />; }
