import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subid = searchParams.get("subid");
  const leadId = searchParams.get("lead_id");
  const campaignId = searchParams.get("campaign_id") ?? "";
  const campaignName = searchParams.get("campaign_name") ?? "";
  const payout = searchParams.get("payout");
  const password = searchParams.get("password");

  console.log("CPALead postback received:", { subid, leadId, campaignName, payout });

  if (!subid || !leadId || !payout) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  if (password !== process.env.CPALEAD_POSTBACK_PASSWORD) return NextResponse.json({ error: "Invalid password" }, { status: 403 });

  const payoutUsd = Number.parseFloat(payout);
  if (!Number.isFinite(payoutUsd) || payoutUsd <= 0) return NextResponse.json({ error: "Invalid payout" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Supabase service configuration is missing" }, { status: 500 });

  const supabase = createClient<Database>(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const coins = Math.round(payoutUsd * 5000);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const raw = Object.fromEntries(searchParams.entries());

  const { data, error } = await supabase.rpc("credit_cpalead_coins", {
    p_subid: subid,
    p_payout: payoutUsd,
    p_coins: coins,
    p_lead_id: leadId,
    p_campaign_id: campaignId,
    p_campaign_name: campaignName,
    p_ip: ip,
    p_raw: raw,
  });
  if (error) {
    console.error("CPALead error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
