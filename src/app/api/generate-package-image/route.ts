export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { packageName, colorPrimary, colorSecondary } = await request.json();
    if (!packageName) return NextResponse.json({ error: "Package name is required" }, { status: 400 });
    const emoji: Record<string, string> = { Free: "gift box", Bronze: "bronze medal with coins", Silver: "silver trophy with coins", Gold: "golden crown with gold coins", Diamond: "shiny blue-purple diamond with sparkles" };
    const prompt = `3D render of a ${emoji[packageName] || "reward coin"} for a Pakistani earning app package tier called "${packageName}". Theme: gradient from ${colorPrimary || "#10b981"} to ${colorSecondary || "#2563eb"}. Style: modern, premium, glossy, mobile-friendly, 16:9 aspect. Soft shadows, no text, clean background.`;
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: "16:9" } }) });
    const data = await response.json();
    const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
    if (!response.ok || !base64Image) return NextResponse.json({ error: "Failed to generate package image", details: data }, { status: 500 });
    return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 500 }); }
}
