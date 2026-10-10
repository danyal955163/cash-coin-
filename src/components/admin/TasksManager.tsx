"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskType = "one_time" | "repeated" | "ad" | "monetag_ad" | "social_share";
type FormState = { is_free_task: boolean; title: string; description: string; task_link: string; coins_reward: string; category: string; status: "active" | "inactive"; task_type: TaskType; ad_duration_seconds: string; ad_url: string; ad_daily_limit: string; cooldown_seconds: string; cooldown_minutes: string; requires_game_id: boolean; instructions: string; ai_review_enabled: boolean; reference_image: File | null; ai_instructions: string; share_message: string; min_proofs: string; max_proofs: string; share_target: string; image: File | null };

const emptyForm: FormState = { is_free_task: false, title: "", description: "", task_link: "", coins_reward: "100", category: "general", status: "active", task_type: "one_time", ad_duration_seconds: "15", ad_url: "", ad_daily_limit: "20", cooldown_seconds: "10", cooldown_minutes: "0", requires_game_id: false, instructions: "", ai_review_enabled: false, reference_image: null, ai_instructions: "", share_message: "", min_proofs: "1", max_proofs: "10", share_target: "10", image: null };
const typeLabel = (type: TaskType, duration?: number | null) => type === "social_share" ? "Social Share" : type === "ad" ? `Adsterra - ${duration ?? 15}s` : type === "monetag_ad" ? `Monetag - ${duration ?? 15}s` : type === "repeated" ? "Repeated" : "One-Time";

function errorMessage(error: { message?: string; code?: string; details?: string; hint?: string }) {
  return `Error: ${error.message ?? "Unknown error"} (Code: ${error.code ?? "unknown"})`;
}

export default function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    const { data, error } = await createClient().from("tasks").select("*").order("created_at", { ascending: false });
    if (error) { console.error("Task list error:", error); toast.error(errorMessage(error)); } else setTasks(data ?? []);
  }
  useEffect(() => { void loadTasks(); }, []);

  function editTask(task: Task) {
    setEditing(task);
    setForm({ is_free_task: task.is_free_task ?? false, title: task.title, description: task.description ?? "", task_link: task.task_link ?? "", coins_reward: String(task.coins_reward ?? task.reward ?? 100), category: task.category ?? "general", status: task.status === "inactive" ? "inactive" : "active", task_type: (task.task_type === "repeated" || task.task_type === "ad" || task.task_type === "monetag_ad" || task.task_type === "social_share" ? task.task_type : "one_time"), ad_duration_seconds: String(task.ad_duration_seconds ?? 15), ad_url: task.ad_url ?? "", ad_daily_limit: String(task.ad_daily_limit ?? 20), cooldown_seconds: String(task.cooldown_seconds ?? 10), cooldown_minutes: String(task.cooldown_minutes ?? 0), requires_game_id: task.requires_game_id ?? false, instructions: task.instructions ?? "", ai_review_enabled: task.ai_review_enabled ?? false, reference_image: null, ai_instructions: task.ai_instructions ?? "", share_message: task.share_message ?? "", min_proofs: String(task.min_proofs ?? 1), max_proofs: String(task.max_proofs ?? 10), share_target: String(task.share_target ?? 10), image: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditing(null); setForm({ ...emptyForm }); }
  const update = (key: keyof FormState, value: string | boolean | File | null) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const coins = Number.parseInt(String(form.coins_reward), 10);
    const adDuration = Number.parseInt(String(form.ad_duration_seconds), 10) || 15;
    const adDailyLimit = Number.parseInt(String(form.ad_daily_limit), 10) || 20;
    const adCooldown = Number.parseInt(String(form.cooldown_seconds), 10) || 10;
    const cooldownMinutes = Number.parseInt(String(form.cooldown_minutes), 10) || 0;
    const minProofs = Math.max(1, Math.min(10, Number.parseInt(String(form.min_proofs), 10) || 1));
    const maxProofs = Math.max(minProofs, Math.min(10, Number.parseInt(String(form.max_proofs), 10) || 10));
    const shareTarget = Math.max(1, Number.parseInt(String(form.share_target), 10) || 1);
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (!Number.isInteger(coins) || coins < 1) { toast.error("Coins must be at least 1"); return; }
    if (coins > 100000) { toast.error("Coins cannot exceed 100,000"); return; }
    if ((form.task_type === "ad" && (adDuration < 5 || adDuration > 120)) || (form.task_type === "monetag_ad" && (adDuration < 10 || adDuration > 120))) { toast.error("Ad duration must be between 5 and 120 seconds"); return; }
    if ((form.task_type === "ad" || form.task_type === "monetag_ad") && (adDailyLimit < 1 || adDailyLimit > 1000)) { toast.error("Ad daily limit must be between 1 and 1,000"); return; }
    if ((form.task_type === "ad" || form.task_type === "monetag_ad") && (adCooldown < 5 || adCooldown > 300)) { toast.error("Ad cooldown must be between 5 and 300 seconds"); return; }
    if (form.task_type === "social_share" && !form.share_message.trim()) { toast.error("Share message is required"); return; }
    if (form.task_type === "repeated" && cooldownMinutes < 0) { toast.error("Cooldown must be zero or greater"); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) { toast.error("Please sign in again before creating a task"); return; }

      let imageUrl = editing?.image_url ?? null;
      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("task-images").upload(fileName, form.image, { cacheControl: "3600", upsert: false, contentType: form.image.type });
        if (uploadError) { console.error("Image upload error:", uploadError); toast.error(`Image upload failed: ${errorMessage(uploadError)}`); return; }
        imageUrl = supabase.storage.from("task-images").getPublicUrl(uploadData.path).data.publicUrl;
      }
      let referenceImageUrl = editing?.reference_image_url ?? null;
      const supportsAiReview = form.task_type === "one_time" || form.task_type === "repeated";
      if (form.ai_review_enabled && supportsAiReview && !editing?.reference_image_url && !form.reference_image) { toast.error("Reference image is required when AI Review is enabled."); return; }
      if (form.ai_review_enabled && supportsAiReview && !form.ai_instructions.trim()) { toast.error("AI Instructions are required when AI Review is enabled."); return; }
      if (form.ai_review_enabled && supportsAiReview && form.reference_image) {
        const fileName = `${Date.now()}-${form.reference_image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("task-references").upload(fileName, form.reference_image, { cacheControl: "3600", upsert: false, contentType: form.reference_image.type });
        if (uploadError) { console.error("Reference image upload error:", uploadError); toast.error(`Reference image upload failed: ${errorMessage(uploadError)}`); return; }
        referenceImageUrl = supabase.storage.from("task-references").getPublicUrl(uploadData.path).data.publicUrl;
      }

      const payload = {
        is_free_task: form.is_free_task, title: form.title.trim(), description: form.description.trim() || null, task_link: form.task_link.trim() || null, image_url: imageUrl, coins_reward: coins, category: form.category.trim() || null, status: form.status, task_type: form.task_type, created_by: authData.user.id,
        ad_url: (form.task_type === "ad" || form.task_type === "monetag_ad") ? (form.ad_url.trim() || (form.task_type === "monetag_ad" ? process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK : process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URL) || null) : null,
        ad_duration_seconds: (form.task_type === "ad" || form.task_type === "monetag_ad") ? adDuration : null,
        ad_daily_limit: (form.task_type === "ad" || form.task_type === "monetag_ad") ? adDailyLimit : 0,
        cooldown_seconds: (form.task_type === "ad" || form.task_type === "monetag_ad") ? adCooldown : 10,
        cooldown_minutes: form.task_type === "repeated" ? cooldownMinutes : 0,
        requires_game_id: (form.task_type === "one_time" || form.task_type === "ad" || form.task_type === "monetag_ad") ? form.requires_game_id : false,
        instructions: form.instructions.trim() || null,
        ai_review_enabled: supportsAiReview && form.ai_review_enabled,
        reference_image_url: supportsAiReview && form.ai_review_enabled ? referenceImageUrl : null,
        ai_instructions: supportsAiReview && form.ai_review_enabled ? (form.ai_instructions.trim() || null) : null,
        share_message: form.task_type === "social_share" ? form.share_message.trim() : null,
        share_target: form.task_type === "social_share" ? shareTarget : 1,
        requires_multiple_proofs: form.task_type === "social_share" || minProofs > 1,
        min_proofs: minProofs,
        max_proofs: maxProofs,
      };
      console.log("Task create/update payload:", payload);
      const result = editing ? await supabase.from("tasks").update(payload).eq("id", editing.id).select().single() : await supabase.from("tasks").insert(payload).select().single();
      if (result.error) { console.error("Task create/update error:", result.error); toast.error(errorMessage(result.error)); return; }
      toast.success(editing ? "Task updated!" : "Task created!");
      reset();
      await loadTasks();
    } catch (error) {
      console.error("Full task save error:", error);
      toast.error(error instanceof Error ? `Error: ${error.message}` : "Error: Unable to save task");
    } finally { setLoading(false); }
  }

  async function deleteTask(id: string) {
    if (!window.confirm("Delete this task?")) return;
    const { error } = await createClient().from("tasks").delete().eq("id", id);
    if (error) { console.error("Task delete error:", error); toast.error(errorMessage(error)); } else { toast.success("Task deleted."); await loadTasks(); }
  }

  return <div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Content</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Task Management</h1></div><form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Task" : "Create New Task"}</h2><div className="mb-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4"><p className="text-sm font-black text-amber-900">Task Category</p><label className="mt-3 flex items-start gap-3 text-sm font-semibold text-amber-900"><input type="checkbox" checked={form.is_free_task} onChange={(e) => update("is_free_task", e.target.checked)} className="mt-1 h-5 w-5" /><span>Mark as FREE task<span className="mt-1 block text-xs font-normal text-amber-800">No package required and no daily limit. Appears on /free-tasks.</span></span></label></div><div className="mt-5 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium text-gray-700">Title<input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Title" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    <label className="text-sm font-medium text-gray-700">Task Link<input value={form.task_link} onChange={(e) => update("task_link", e.target.value)} placeholder="Optional URL" type="url" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    <label className="text-sm font-medium text-gray-700 md:col-span-2">Description<textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Description" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" rows={3} /></label>
    <label className="text-sm font-medium text-gray-700">Task Type<select value={form.task_type} onChange={(e) => update("task_type", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="one_time">One-Time</option><option value="repeated">Repeated</option><option value="ad">Adsterra Ad</option><option value="monetag_ad">Monetag Ad (Direct Link)</option><option value="social_share">Social Share</option></select></label>
    <label className="text-sm font-medium text-gray-700">Status<select value={form.status} onChange={(e) => update("status", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
    <label className="text-sm font-medium text-gray-700">Coins Reward<input required min={1} max={100000} type="number" value={form.coins_reward} onChange={(e) => update("coins_reward", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    <label className="text-sm font-medium text-gray-700">Category<input value={form.category} onChange={(e) => update("category", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    {form.task_type === "social_share" && <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 md:col-span-2"><p className="text-sm font-black text-violet-900">Social share verification</p><label className="mt-3 block text-sm font-medium text-violet-900">Share Message (required)<textarea value={form.share_message} onChange={(e) => update("share_message", e.target.value)} placeholder="Join CashCoin and earn real money! [LINK] - Referred by [USERNAME]" rows={3} className="mt-2 block w-full rounded-lg border border-violet-300 bg-white px-3 py-2.5" /></label><div className="mt-3 grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium text-violet-900">Minimum Screenshots<input min={1} max={10} type="number" value={form.min_proofs} onChange={(e) => update("min_proofs", e.target.value)} className="mt-2 block w-full rounded-lg border border-violet-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-violet-900">Maximum Screenshots<input min={1} max={10} type="number" value={form.max_proofs} onChange={(e) => update("max_proofs", e.target.value)} className="mt-2 block w-full rounded-lg border border-violet-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-violet-900">Target People<input min={1} type="number" value={form.share_target} onChange={(e) => update("share_target", e.target.value)} className="mt-2 block w-full rounded-lg border border-violet-300 px-3 py-2.5" /></label></div><p className="mt-2 text-xs text-violet-700">Placeholders: [USERNAME], [LINK], [COINS]</p></div>}{(form.task_type === "ad" || form.task_type === "monetag_ad") && <label className="text-sm font-medium text-gray-700">Ad URL<input value={form.ad_url} onChange={(e) => update("ad_url", e.target.value)} placeholder="Optional Ad URL" type="url" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {(form.task_type === "ad" || form.task_type === "monetag_ad") && <label className="text-sm font-medium text-gray-700">Ad Duration (seconds)<input required min={form.task_type === "monetag_ad" ? 10 : 5} max={120} type="number" value={form.ad_duration_seconds} onChange={(e) => update("ad_duration_seconds", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {(form.task_type === "ad" || form.task_type === "monetag_ad") && <label className="text-sm font-medium text-gray-700">Ad Daily Limit<input required min={1} max={1000} type="number" value={form.ad_daily_limit} onChange={(e) => update("ad_daily_limit", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {(form.task_type === "ad" || form.task_type === "monetag_ad") && <label className="text-sm font-medium text-gray-700">Cooldown (seconds)<input required min={5} max={300} type="number" value={form.cooldown_seconds} onChange={(e) => update("cooldown_seconds", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {form.task_type === "repeated" && <label className="text-sm font-medium text-gray-700">Cooldown (minutes)<input required min={0} type="number" value={form.cooldown_minutes} onChange={(e) => update("cooldown_minutes", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}

    {(form.task_type === "one_time" || form.task_type === "ad" || form.task_type === "monetag_ad") && <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 md:col-span-2"><label className="flex items-start gap-3 text-sm font-bold text-yellow-900"><input type="checkbox" checked={form.requires_game_id} onChange={(e) => update("requires_game_id", e.target.checked)} className="mt-1 h-4 w-4" /><span>Requires Game ID<p className="mt-1 text-xs font-normal text-yellow-800">Require user to submit Game ID and Account Name</p><span className="mt-1 block text-xs font-normal text-yellow-700">Enable for game/app install tasks where user must create a new account</span></span></label><label className="mt-4 block text-sm font-medium text-yellow-900">Task Instructions<textarea value={form.instructions} onChange={(e) => update("instructions", e.target.value)} placeholder="e.g., Create a NEW account. If you already have an account on this app, you will NOT receive rewards." rows={3} className="mt-2 block w-full rounded-lg border border-yellow-300 bg-white px-3 py-2.5 text-sm" /><span className="mt-1 block text-xs font-normal text-yellow-700">This will be shown to the user on the proof submission modal</span></label></div>}
    {(form.task_type === "one_time" || form.task_type === "repeated") && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 md:col-span-2"><label className="flex items-start gap-3 text-sm font-bold text-indigo-900"><input type="checkbox" checked={form.ai_review_enabled} onChange={(e) => update("ai_review_enabled", e.target.checked)} className="mt-1 h-4 w-4" /><span>Enable AI Review<p className="mt-1 text-xs font-normal text-indigo-800">Gemini will automatically review submitted proof screenshots.</p></span></label>{form.ai_review_enabled && <div className="mt-4 grid gap-4"><label className="text-sm font-medium text-indigo-900">Reference Image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => update("reference_image", e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /><span className="mt-1 block text-xs font-normal text-indigo-700">Upload an example of the correct proof screenshot.</span></label><label className="text-sm font-medium text-indigo-900">AI Instructions<textarea value={form.ai_instructions} onChange={(e) => update("ai_instructions", e.target.value)} placeholder="e.g., Screenshot must show Level 5, Game ID, and account name" rows={3} className="mt-2 block w-full rounded-lg border border-indigo-300 bg-white px-3 py-2.5 text-sm" /></label></div>}</div>}
    <label className="text-sm font-medium text-gray-700">Image Upload<input type="file" accept="image/*" onChange={(e) => update("image", e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label>
  </div><div className="mt-5 flex gap-3"><button disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : editing ? "Update Task" : "Create Task"}</button>{editing && <button type="button" onClick={reset} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>}</div></form>
  <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"><table className="min-w-[700px] w-full text-left text-sm"><thead className="border-b border-gray-200 text-gray-500"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Coins</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{tasks.map((task) => <tr key={task.id}><td className="px-4 py-3 font-medium">{task.title}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${task.task_type === "social_share" ? "bg-violet-100 text-violet-800" : task.task_type === "ad" ? "bg-orange-100 text-orange-800" : task.task_type === "monetag_ad" ? "bg-purple-100 text-purple-800" : task.task_type === "repeated" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{typeLabel((task.task_type === "repeated" || task.task_type === "ad" || task.task_type === "monetag_ad" || task.task_type === "social_share" ? task.task_type : "one_time"), task.ad_duration_seconds)}</span></td><td className="px-4 py-3">{task.is_free_task ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">FREE</span> : <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-black text-purple-800">PACKAGE</span>}</td><td className="px-4 py-3">{task.requires_game_id ? <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">Requires Game ID</span> : "—"}</td><td className="px-4 py-3">{task.coins_reward ?? task.reward}</td><td className="px-4 py-3">{task.status}</td><td className="px-4 py-3"><button type="button" onClick={() => editTask(task)} className="mr-3 font-semibold text-emerald-600">Edit</button><button type="button" onClick={() => void deleteTask(task.id)} className="font-semibold text-red-600">Delete</button></td></tr>)}</tbody></table>{!tasks.length && <p className="p-8 text-center text-sm text-gray-500">No tasks found.</p>}</div></div>;
}
