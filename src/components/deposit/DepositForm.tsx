"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function DepositForm({ amount, packageName }: { amount: number; packageName: string }) {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!screenshot) {
      toast.error("Payment screenshot is required.");
      return;
    }
    if (!ALLOWED_TYPES.includes(screenshot.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      return;
    }
    if (screenshot.size > MAX_FILE_SIZE) {
      toast.error("File is too big. Maximum size is 5MB.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError || !authData.user) {
        toast.error("Please log in before submitting a deposit.");
        return;
      }

      const sanitizedFilename = screenshot.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${authData.user.id}/${Date.now()}-${sanitizedFilename}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, screenshot, { cacheControl: "3600", upsert: false, contentType: screenshot.type });
      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicData } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;
      const { error: insertError } = await supabase.from("deposits").insert({
        user_id: authData.user.id,
        user_email: authData.user.email ?? null,
        amount_sent: amount,
        amount,
        amount_pkr: amount,
        transaction_id: transactionId.trim(),
        transaction_reference: transactionId.trim(),
        proof_image: publicUrl,
        proof_image_url: publicUrl,
        screenshot_url: publicUrl,
        image_url: publicUrl,
        proof_url: publicUrl,
        package_name: packageName,
        status: "pending",
      });
      if (insertError) {
        toast.error(`Deposit submission failed: ${insertError.message}`);
        return;
      }

      toast.success("Deposit submitted! Admin will review soon.");
      window.setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div className="space-y-5">
        <label className="block text-sm font-medium text-gray-700">
          Transaction ID
          <input required value={transactionId} onChange={(event) => setTransactionId(event.target.value)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="Enter your transaction ID" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Payment Screenshot
          <input required type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-700" />
          <span className="mt-2 block text-xs text-gray-500">JPG, JPEG, PNG or WEBP only. Maximum 5MB.</span>
        </label>
      </div>
      <button disabled={isSubmitting} type="submit" className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit Deposit"}
      </button>
    </form>
  );
}
