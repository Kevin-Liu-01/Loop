import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth-layout";

export const metadata: Metadata = {
  description:
    "Sign in to Loop – the operator desk for self-updating agent skills.",
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <AuthSplitLayout mode="sign-in">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </AuthSplitLayout>
  );
}
