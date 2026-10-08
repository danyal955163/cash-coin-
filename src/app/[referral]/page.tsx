import { redirect } from "next/navigation";

export default async function ShortReferralPage({
  params,
}: {
  params: Promise<{ referral: string }>;
}) {
  const { referral } = await params;
  redirect(`/signup?ref=${encodeURIComponent(referral)}`);
}
