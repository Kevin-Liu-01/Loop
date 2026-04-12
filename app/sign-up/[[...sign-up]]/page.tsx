import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth-layout";

export const metadata: Metadata = {
  description:
    "Create your Loop account and unlock the full operator toolkit for agent skills.",
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <AuthSplitLayout mode="sign-up">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </AuthSplitLayout>
  );
}
