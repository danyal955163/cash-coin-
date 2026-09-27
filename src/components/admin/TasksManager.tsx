"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type FormState = { title: string; description: string; task_link: string; coins_reward: string; status: "active" | "inactive"; image: File | null };
const emptyForm: FormState = { title: "", description: "", task_link: "", coins_reward: "100", status: "active", image: null };

export default function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTasks() { const { data, error } = await createClient().from("tasks").select("*").order("created_at", { ascending: false }); if (error) toast.error(error.message); else setTasks(data ?? []); }
  useEffect(() => { void loadTasks(); }, []);

  function editTask(task: Task) { setEditing(task); setForm({ title: task.title, description: task.description ?? "", task_link: task.task_link ?? "", coins_reward: String(task.coins_reward ?? task.reward ?? 100), status: task.status === "inactive" ? "inactive" : "active", image: null }); }
  function reset() { setEditing(null); setForm(emptyForm); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const coins = Number(form.coins_reward);
    if (!form.title.trim() || !Number.isInteger(coins) || coins < 1 || coins > 100000) { toast.error("Enter a title and coins reward between 1 and 100,000."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      let imageUrl = editing?.image_url ?? null;
      if (form.image) {
        const safeName = form.image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `tasks/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("task-images").upload(path, form.image, { upsert: false, contentType: form.image.type });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("task-images").getPublicUrl(path).data.publicUrl;
      }
      const payload = { title: form.title.trim(), description: form.description.trim() || null, task_link: form.task_link.trim() || null, image_url: imageUrl, coins_reward: coins, reward: coins, category: "general", status: form.status, is_active: form.status === "active" };
      const result = editing ? await supabase.from("tasks").update(payload).eq("id", editing.id) : await supabase.from("tasks").insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id ?? null });
      if (result.error) throw result.error;
      toast.success(editing ? "Task updated." : "Task created."); reset(); await loadTasks();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save task."); } finally { setLoading(false); }
  }

  async function deleteTask(id: string) { if (!window.confirm("Delete this task?")) return; const { error } = await createClient().from("tasks").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Task deleted."); await loadTasks(); } }

  return <div><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Content</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Task Management</h1></div><form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Task" : "Create New Task"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-lg border border-gray-300 px-3 py-2.5" /><input value={form.task_link} onChange={(e) => setForm({ ...form, task_link: e.target.value })} placeholder="Task Link (URL)" type="url" className="rounded-lg border border-gray-300 px-3 py-2.5" /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-lg border border-gray-300 px-3 py-2.5 md:col-span-2" rows={3} /><label className="text-sm font-medium text-gray-700">Image upload<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })} className="mt-2 block w-full text-sm" /></label><label className="text-sm font-medium text-gray-700">Coins Reward - Admin decides (100=1 PKR)<input required min={1} max={100000} type="number" value={form.coins_reward} onChange={(e) => setForm({ ...form, coins_reward: e.target.value })} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })} className="rounded-lg border border-gray-300 px-3 py-2.5"><option value="active">Active</option><option value="inactive">Inactive</option></select></div><div className="mt-5 flex gap-3"><button disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Saving..." : "Submit"}</button>{editing && <button type="button" onClick={reset} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>}</div></form><div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"><table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 text-gray-500"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Coins</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{tasks.map((task) => <tr key={task.id}><td className="px-4 py-3 font-medium">{task.title}</td><td className="px-4 py-3">{task.coins_reward ?? task.reward}</td><td className="px-4 py-3">{task.status}</td><td className="px-4 py-3"><button onClick={() => editTask(task)} className="mr-3 font-semibold text-emerald-600">Edit</button><button onClick={() => void deleteTask(task.id)} className="font-semibold text-red-600">Delete</button></td></tr>)}</tbody></table>{!tasks.length && <p className="p-8 text-center text-sm text-gray-500">No tasks found.</p>}</div></div>;
}
