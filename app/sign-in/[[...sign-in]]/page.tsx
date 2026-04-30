import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth-layout";

export const metadata: Metadata = {
  description:
    "Sign in to Loop – the operator desk for source-backed agent skills.",
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <AuthSplitLayout mode="sign-in">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </AuthSplitLayout>
  );
}
