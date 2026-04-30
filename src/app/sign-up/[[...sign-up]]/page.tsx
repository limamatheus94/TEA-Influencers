import { SignUp } from "@clerk/nextjs";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { invite?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp />
    </div>
  );
}
