import SignupForm from "@/components/auth/SignupForm";
import LiveActivityNotification from "@/components/social-proof/LiveActivityNotification";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return <><LiveActivityNotification /><SignupForm initialReferralCode={searchParams.ref ?? ""} /></>;
}
