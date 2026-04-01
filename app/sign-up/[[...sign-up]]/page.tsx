import type { Metadata } from "next";

import { SignUp } from "@clerk/nextjs";

import { AuthSplitLayout } from "@/components/auth-layout";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Loop account and unlock the full operator toolkit for agent skills.",
};

export default function SignUpPage() {
  return (
    <AuthSplitLayout mode="sign-up">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </AuthSplitLayout>
  );
}
