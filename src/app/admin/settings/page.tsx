import SiteSettingsManager from "@/components/admin/SiteSettingsManager";

export default function AdminSettingsPage() {
  return <section className="space-y-7"><div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Platform setup</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Configure CashCoin</h2><p className="mt-2 text-sm text-emerald-50">Fine-tune the details that power the experience.</p></div><div className="min-w-0 rounded-3xl bg-white/70 p-3 ring-1 ring-slate-200 sm:p-5"><SiteSettingsManager /></div></section>;
}
