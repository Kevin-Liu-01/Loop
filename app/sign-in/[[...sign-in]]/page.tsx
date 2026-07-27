import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth-layout";
import { LIBRARY_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/navigation";

export const metadata: Metadata = {
  description:
    "Sign in to Loop – the operator desk for source-backed agent skills.",
  robots: { follow: false, index: false },
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <AuthSplitLayout mode="sign-in">
      <SignIn
        fallbackRedirectUrl={LIBRARY_PATH}
        forceRedirectUrl={LIBRARY_PATH}
        routing="path"
        path={SIGN_IN_PATH}
        signUpUrl={SIGN_UP_PATH}
      />
    </AuthSplitLayout>
  );
}
