"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskType = "one_time" | "repeated" | "ad";
type FormState = { title: string; description: string; task_link: string; coins_reward: string; category: string; status: "active" | "inactive"; task_type: TaskType; ad_duration_seconds: string; ad_url: string; ad_daily_limit: string; cooldown_seconds: string; cooldown_minutes: string; image: File | null };

const emptyForm: FormState = { title: "", description: "", task_link: "", coins_reward: "100", category: "general", status: "active", task_type: "one_time", ad_duration_seconds: "15", ad_url: "", ad_daily_limit: "20", cooldown_seconds: "10", cooldown_minutes: "0", image: null };
const typeLabel = (type: TaskType, duration?: number | null) => type === "ad" ? `Ad - ${duration ?? 15}s` : type === "repeated" ? "Repeated" : "One-Time";

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
    setForm({ title: task.title, description: task.description ?? "", task_link: task.task_link ?? "", coins_reward: String(task.coins_reward ?? task.reward ?? 100), category: task.category ?? "general", status: task.status === "inactive" ? "inactive" : "active", task_type: (task.task_type === "repeated" || task.task_type === "ad" ? task.task_type : "one_time"), ad_duration_seconds: String(task.ad_duration_seconds ?? 15), ad_url: task.ad_url ?? "", ad_daily_limit: String(task.ad_daily_limit ?? 20), cooldown_seconds: String(task.cooldown_seconds ?? 10), cooldown_minutes: String(task.cooldown_minutes ?? 0), image: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditing(null); setForm({ ...emptyForm }); }
  const update = (key: keyof FormState, value: string | File | null) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const coins = Number.parseInt(String(form.coins_reward), 10);
    const adDuration = Number.parseInt(String(form.ad_duration_seconds), 10) || 15;
    const adDailyLimit = Number.parseInt(String(form.ad_daily_limit), 10) || 20;
    const adCooldown = Number.parseInt(String(form.cooldown_seconds), 10) || 10;
    const cooldownMinutes = Number.parseInt(String(form.cooldown_minutes), 10) || 0;
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (!Number.isInteger(coins) || coins < 1) { toast.error("Coins must be at least 1"); return; }
    if (coins > 100000) { toast.error("Coins cannot exceed 100,000"); return; }
    if (form.task_type === "ad" && (adDuration < 5 || adDuration > 120)) { toast.error("Ad duration must be between 5 and 120 seconds"); return; }
    if (form.task_type === "ad" && (adDailyLimit < 1 || adDailyLimit > 1000)) { toast.error("Ad daily limit must be between 1 and 1,000"); return; }
    if (form.task_type === "ad" && (adCooldown < 5 || adCooldown > 300)) { toast.error("Ad cooldown must be between 5 and 300 seconds"); return; }
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

      const payload = {
        title: form.title.trim(), description: form.description.trim() || null, task_link: form.task_link.trim() || null, image_url: imageUrl, coins_reward: coins, category: form.category.trim() || null, status: form.status, task_type: form.task_type, created_by: authData.user.id,
        ad_url: form.task_type === "ad" ? (form.ad_url.trim() || process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URL || null) : null,
        ad_duration_seconds: form.task_type === "ad" ? adDuration : null,
        ad_daily_limit: form.task_type === "ad" ? adDailyLimit : 0,
        cooldown_seconds: form.task_type === "ad" ? adCooldown : 10,
        cooldown_minutes: form.task_type === "repeated" ? cooldownMinutes : 0,
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

  return <div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Content</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Task Management</h1></div><form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Task" : "Create New Task"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium text-gray-700">Title<input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Title" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    <label className="text-sm font-medium text-gray-700">Task Link<input value={form.task_link} onChange={(e) => update("task_link", e.target.value)} placeholder="Optional URL" type="url" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    <label className="text-sm font-medium text-gray-700 md:col-span-2">Description<textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Description" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" rows={3} /></label>
    <label className="text-sm font-medium text-gray-700">Task Type<select value={form.task_type} onChange={(e) => update("task_type", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="one_time">One-Time</option><option value="repeated">Repeated</option><option value="ad">Ad</option></select></label>
    <label className="text-sm font-medium text-gray-700">Status<select value={form.status} onChange={(e) => update("status", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
    <label className="text-sm font-medium text-gray-700">Coins Reward<input required min={1} max={100000} type="number" value={form.coins_reward} onChange={(e) => update("coins_reward", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    <label className="text-sm font-medium text-gray-700">Category<input value={form.category} onChange={(e) => update("category", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
    {form.task_type === "ad" && <label className="text-sm font-medium text-gray-700">Ad URL<input value={form.ad_url} onChange={(e) => update("ad_url", e.target.value)} placeholder="Optional Ad URL" type="url" className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {form.task_type === "ad" && <label className="text-sm font-medium text-gray-700">Ad Duration (seconds)<input required min={5} max={120} type="number" value={form.ad_duration_seconds} onChange={(e) => update("ad_duration_seconds", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {form.task_type === "ad" && <label className="text-sm font-medium text-gray-700">Ad Daily Limit<input required min={1} max={1000} type="number" value={form.ad_daily_limit} onChange={(e) => update("ad_daily_limit", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {form.task_type === "ad" && <label className="text-sm font-medium text-gray-700">Cooldown (seconds)<input required min={5} max={300} type="number" value={form.cooldown_seconds} onChange={(e) => update("cooldown_seconds", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}
    {form.task_type === "repeated" && <label className="text-sm font-medium text-gray-700">Cooldown (minutes)<input required min={0} type="number" value={form.cooldown_minutes} onChange={(e) => update("cooldown_minutes", e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>}

    <label className="text-sm font-medium text-gray-700">Image Upload<input type="file" accept="image/*" onChange={(e) => update("image", e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label>
  </div><div className="mt-5 flex gap-3"><button disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : editing ? "Update Task" : "Create Task"}</button>{editing && <button type="button" onClick={reset} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>}</div></form>
  <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"><table className="min-w-[700px] w-full text-left text-sm"><thead className="border-b border-gray-200 text-gray-500"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Coins</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{tasks.map((task) => <tr key={task.id}><td className="px-4 py-3 font-medium">{task.title}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{typeLabel((task.task_type === "repeated" || task.task_type === "ad" ? task.task_type : "one_time"), task.ad_duration_seconds)}</span></td><td className="px-4 py-3">{task.coins_reward ?? task.reward}</td><td className="px-4 py-3">{task.status}</td><td className="px-4 py-3"><button type="button" onClick={() => editTask(task)} className="mr-3 font-semibold text-emerald-600">Edit</button><button type="button" onClick={() => void deleteTask(task.id)} className="font-semibold text-red-600">Delete</button></td></tr>)}</tbody></table>{!tasks.length && <p className="p-8 text-center text-sm text-gray-500">No tasks found.</p>}</div></div>;
}
