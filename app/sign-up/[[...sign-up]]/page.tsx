import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth-layout";
import { LIBRARY_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/navigation";

export const metadata: Metadata = {
  description:
    "Create your Loop account and unlock the full operator toolkit for agent skills.",
  robots: { follow: false, index: false },
  title: "Sign up",
};

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <AuthSplitLayout mode="sign-up">
      <SignUp
        fallbackRedirectUrl={LIBRARY_PATH}
        forceRedirectUrl={LIBRARY_PATH}
        routing="path"
        path={SIGN_UP_PATH}
        signInUrl={SIGN_IN_PATH}
      />
    </AuthSplitLayout>
  );
}
