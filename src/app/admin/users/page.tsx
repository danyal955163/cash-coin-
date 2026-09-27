import UsersManager from "@/components/admin/UsersManager";
import { createClient } from "@/lib/supabase/server";
export default async function AdminUsersPage() { const { data: profiles } = await createClient().from("profiles").select("*").order("created_at", { ascending: false }); return <UsersManager profiles={(profiles ?? []).map((profile) => ({ ...profile, email: typeof (profile as { email?: unknown }).email === "string" ? (profile as unknown as { email: string }).email : null }))} />; }
