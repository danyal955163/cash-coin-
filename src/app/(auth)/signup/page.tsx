import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return <SignupForm initialReferralCode={searchParams.ref ?? ""} />;
}
