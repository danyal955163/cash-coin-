import { redirect } from "next/navigation";
import SupportChat from "@/components/support/SupportChat";
import { createClient } from "@/lib/supabase/server";
export default async function HelpPage() { const { data: { user } } = await createClient().auth.getUser(); if (!user) redirect("/login"); return <section className="space-y-6"><div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Help center</p><h1 className="mt-2 text-3xl font-black tracking-tight">We’re here to help.</h1><p className="mt-2 text-sm text-emerald-50">Ask a question or send a screenshot to our support assistant.</p></div><SupportChat userId={user.id} /></section>; }
