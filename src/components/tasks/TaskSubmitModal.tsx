"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

type Task = { id: string; title: string; coins_reward: number; description: string | null; task_type?: "one_time" | "repeated" | "ad" };
export default function TaskSubmitModal({ task, userId, onClose, onSubmitted }: { task: Task; userId: string; onClose: () => void; onSubmitted: () => void }) {
  const [file, setFile] = useState<File | null>(null); const [loading, setLoading] = useState(false);
  async function submit() {
    if (task.task_type === "ad") return toast.error("Ad tasks complete automatically after the timer.");
    if (!file) return toast.error("Please select a proof image.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Only JPG, JPEG, PNG and WEBP images are allowed.");
    if (file.size > 5 * 1024 * 1024) return toast.error("File is too big. Maximum size is 5MB.");
    setLoading(true);
    try {
      const supabase = createClient(); const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); const path = `${userId}/${Date.now()}-${safe}`;
      const upload = await supabase.storage.from("task-proofs").upload(path, file, { upsert: false, contentType: file.type });
      if (upload.error) throw upload.error;
      const url = supabase.storage.from("task-proofs").getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("user_tasks").insert({ user_id: userId, task_id: task.id, proof_image_url: url, status: "pending", coins_earned: 0 });
      if (error) throw error;
      toast.success("Proof submitted! Admin will review and credit coins."); onSubmitted();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Network error. Please try again."); } finally { setLoading(false); }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-gray-900">Submit Proof</h2><p className="mt-1 text-sm text-gray-600">{task.title} · +{task.coins_reward} coins</p></div><button onClick={onClose} className="text-2xl text-gray-400" aria-label="Close">×</button></div><input className="mt-6 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><p className="mt-2 text-xs text-gray-500">Image only, maximum 5MB.</p><button disabled={loading} onClick={() => void submit()} className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Submitting..." : "Submit Proof"}</button></div></div>;
}
