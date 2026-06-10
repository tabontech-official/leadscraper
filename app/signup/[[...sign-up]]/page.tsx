import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
}
