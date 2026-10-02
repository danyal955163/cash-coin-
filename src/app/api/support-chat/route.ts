import { NextRequest, NextResponse } from "next/server";

const MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";
const SYSTEM_PROMPT = `You are CashCoin Support Assistant.
Speak in both Urdu and English and match the user's language. If Urdu, reply in Urdu. If English, reply in English. If mixed, use concise Roman Urdu.
CashCoin is a Pakistani task-based earning platform. Sign up is free. Packages are Free, 200 PKR, 300 PKR, 400 PKR and 500 PKR; paid packages last 15 days. 100 coins = 1 PKR. Daily tasks: Free 1, 200 PKR 4, 300 PKR 6, 400 PKR 8, 500 PKR 10. Task types include Adsterra ads, offers and game install tasks. Withdrawals use JazzCash/EasyPaisa; minimum is 200 PKR for paid users and 500 PKR for Free users. Referral rewards are 1 PKR per referred task up to 50 PKR and 10% commission on a referral package purchase. Coins credit after admin approves proof. Deposits are manually reviewed; approval activates the selected package and does not add wallet balance. Common guidance: pending deposits usually take 24-48 hours; rejected withdrawals refund coins; rejected task proofs can be resubmitted; paid packages expire after 15 days; use Forgot Password for password recovery.
Contact: WhatsApp Support +92 326 9337540, Telegram @CashcoinOfficiall, support@cashcoin.pk.
Be friendly, short and helpful. Never request passwords, payment card data, admin keys or secrets. If uncertain, recommend human support. If a screenshot is provided, describe what it shows and suggest the next step.`;

type ChatItem = { role: "user" | "assistant"; text: string };

type OpenRouterResponse = { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { message?: string; history?: ChatItem[]; screenshotBase64?: string; screenshotMimeType?: string };
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Support AI is not configured yet. Please contact WhatsApp support: +92 326 9337540" }, { status: 503 });
    const message = body.message?.trim() || "The user sent a support screenshot. Please analyze it.";
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string | Array<Record<string, unknown>> }> = [{ role: "system", content: SYSTEM_PROMPT }];
    for (const item of (body.history ?? []).slice(-12)) messages.push({ role: item.role, content: item.text });
    const userContent: Array<Record<string, unknown>> = [{ type: "text", text: message }];
    if (body.screenshotBase64) {
      const raw = body.screenshotBase64.includes(",") ? body.screenshotBase64.split(",", 2)[1] : body.screenshotBase64;
      userContent.push({ type: "image_url", image_url: { url: `data:${body.screenshotMimeType || "image/png"};base64,${raw}` } });
    }
    messages.push({ role: "user", content: userContent });
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://cash-coin-peach.vercel.app", "X-Title": "CashCoin Support" }, body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 500 }) });
    const data = await response.json() as OpenRouterResponse;
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Support AI request failed." }, { status: 502 });
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content?.trim() || "Sorry, please contact WhatsApp support: +92 326 9337540" });
  } catch (error) { console.error("Support AI error:", error); return NextResponse.json({ error: "Sorry, technical issue. Please contact WhatsApp support: +92 326 9337540" }, { status: 500 }); }
}
