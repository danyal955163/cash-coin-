import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";
type Decision = "approve" | "reject" | "manual";
type AiResult = { score: number; decision: Decision; reason: string; matches_reference: boolean; screenshot_clear: boolean; screenshot_authentic: boolean };
type OpenRouterResponse = { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

async function imageData(url: string, label: string) { const response = await fetch(url); if (!response.ok) throw new Error(`Unable to download ${label} image.`); const mime = response.headers.get("content-type") || "image/png"; const data = Buffer.from(await response.arrayBuffer()).toString("base64"); return { type: "image_url", image_url: { url: `data:${mime};base64,${data}` } }; }
function fallback(reason = "AI could not confidently analyze this proof. An admin will review it."): AiResult { return { score: 50, decision: "manual", reason, matches_reference: false, screenshot_clear: false, screenshot_authentic: false }; }
function parseResult(text: string): AiResult { try { const match = text.match(/\{[\s\S]*\}/); if (!match) return fallback(); const raw = JSON.parse(match[0]) as Partial<AiResult>; const score = Math.min(100, Math.max(0, Number(raw.score) || 50)); const decision: Decision = raw.decision === "approve" || raw.decision === "reject" || raw.decision === "manual" ? raw.decision : score >= 90 ? "approve" : score < 50 ? "reject" : "manual"; return { score, decision, reason: typeof raw.reason === "string" && raw.reason.trim() ? raw.reason.trim().slice(0, 100) : "AI review completed.", matches_reference: raw.matches_reference === true, screenshot_clear: raw.screenshot_clear === true, screenshot_authentic: raw.screenshot_authentic === true }; } catch { return fallback(); } }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { user_task_id?: string; task_id?: string; proof_image_url?: string; game_id?: string; account_name?: string };
    const { user_task_id, task_id, proof_image_url, game_id, account_name } = body;
    if (!user_task_id || !task_id || !proof_image_url) return NextResponse.json({ error: "user_task_id, task_id and proof_image_url are required." }, { status: 400 });
    if (!process.env.OPENROUTER_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ decision: "manual", score: 50, reason: "AI review is not configured; your proof was sent to admin review." });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: task, error: taskError } = await supabase.from("tasks").select("id, title, description, instructions, ai_instructions, ai_review_enabled, reference_image_url, coins_reward").eq("id", task_id).single();
    if (taskError || !task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (!task.ai_review_enabled) return NextResponse.json({ decision: "manual", score: 50, reason: "This task uses manual review." });
    const { data: userTask, error: userTaskError } = await supabase.from("user_tasks").select("id, user_id, task_id, status").eq("id", user_task_id).single();
    if (userTaskError || !userTask || userTask.task_id !== task_id) return NextResponse.json({ error: "Task proof not found" }, { status: 404 });
    if (userTask.status !== "pending") return NextResponse.json({ decision: userTask.status === "approved" ? "approve" : userTask.status === "rejected" ? "reject" : "manual", score: 50, reason: "This proof was already reviewed." });
    const prompt = `You are a strict task proof reviewer for CashCoin. Analyze the USER PROOF IMAGE and compare it with the REFERENCE IMAGE when provided. Return JSON ONLY: {"score":0,"decision":"approve","reason":"short explanation max 100 chars","screenshot_clear":true,"screenshot_authentic":true,"matches_reference":true}. Decision rules: 90-100 approve, 50-89 manual, 0-49 reject. Approve only when the screenshot is clear, authentic, shows the requested elements, and matches the requirements/reference.\n\nTASK TITLE: ${task.title}\nDESCRIPTION: ${task.description || "N/A"}\nINSTRUCTIONS: ${task.instructions || "N/A"}\nAI INSTRUCTIONS: ${task.ai_instructions || "N/A"}\nCOINS: ${task.coins_reward}\nGAME ID: ${game_id || "not provided"}\nACCOUNT NAME: ${account_name || "not provided"}`;
    const content: Array<Record<string, unknown>> = [];
    if (task.reference_image_url) { content.push({ type: "text", text: "REFERENCE IMAGE:" }); content.push(await imageData(task.reference_image_url, "reference")); }
    content.push({ type: "text", text: "USER PROOF IMAGE:" }); content.push(await imageData(proof_image_url, "proof")); content.push({ type: "text", text: prompt });
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json", "HTTP-Referer": "https://cash-coin-peach.vercel.app", "X-Title": "CashCoin AI Review" }, body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content }], temperature: 0.3, max_tokens: 500 }) });
    const aiData = await aiResponse.json() as OpenRouterResponse;
    if (!aiResponse.ok) throw new Error(aiData.error?.message || "OpenRouter review failed.");
    const result = parseResult(aiData.choices?.[0]?.message?.content || "");
    const status = result.decision === "approve" ? "approved" : result.decision === "reject" ? "rejected" : "pending";
    const { error: updateError } = await supabase.from("user_tasks").update({ ai_score: result.score, ai_reason: result.reason, ai_decision: result.decision, status, coins_earned: result.decision === "approve" ? task.coins_reward : 0, completed_at: result.decision === "approve" ? new Date().toISOString() : null }).eq("id", user_task_id).eq("status", "pending");
    if (updateError) throw updateError;
    if (result.decision === "approve") { const { error: creditError } = await supabase.rpc("credit_task_coins", { p_user_id: userTask.user_id, p_coins: task.coins_reward, p_task_title: task.title }); if (creditError) throw creditError; await supabase.from("notifications").insert({ user_id: userTask.user_id, title: "✅ Task Approved!", message: `${task.title} - You earned ${task.coins_reward} coins!`, type: "success", link: "/wallet" }); } else if (result.decision === "reject") await supabase.from("notifications").insert({ user_id: userTask.user_id, title: "❌ Task Rejected", message: `${task.title} - ${result.reason}. Please resubmit your proof.`, type: "warning", link: "/tasks" });
    return NextResponse.json(result);
  } catch (error) { console.error("AI task review error:", error); return NextResponse.json({ decision: "manual", score: 50, reason: "AI review was unavailable. Your proof was sent to admin review." } satisfies Partial<AiResult>); }
}
