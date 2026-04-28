import type { Metadata } from "next";

import { AppGridShell } from "@/components/app-grid-shell";
import { SiteHeader } from "@/components/site-header";
import {
  PageHeader,
  PageHeaderLead,
  PageHeaderSub,
  PageHeaderTitle,
} from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { buildPageMetadata } from "@/lib/seo";
import { pageInsetColumnClass } from "@/lib/ui-layout";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How Loop collects, uses, and protects your data when you use the platform.";
const EFFECTIVE_DATE = "April 27, 2026";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/privacy",
});

const sectionHeading =
  "mt-10 mb-3 text-lg font-semibold tracking-tight first:mt-0";
const prose = "text-sm leading-relaxed text-ink-muted [&_a]:underline";
const list =
  "mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-muted";

export default function PrivacyPage() {
  return (
    <AppGridShell header={<SiteHeader />}>
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={pageInsetColumnClass(
            "grid min-h-0 flex-1 gap-8 overflow-y-auto pb-16"
          )}
        >
          <PageHeader>
            <PageHeaderLead>
              <PageHeaderTitle>{TITLE}</PageHeaderTitle>
              <PageHeaderSub>Effective {EFFECTIVE_DATE}</PageHeaderSub>
            </PageHeaderLead>
          </PageHeader>

          <article className="max-w-[68ch]">
            <h2 className={sectionHeading}>1. Information We Collect</h2>
            <p className={prose}>
              When you create an account or use Loop, we may collect:
            </p>
            <ul className={list}>
              <li>
                Account information (name, email address) via our authentication
                provider.
              </li>
              <li>
                Usage data such as skills created, automations configured, and
                feature interactions.
              </li>
              <li>
                Technical data including browser type, device information, and
                IP address.
              </li>
              <li>
                Payment information processed securely through Stripe &mdash; we
                never store card details directly.
              </li>
            </ul>

            <h2 className={sectionHeading}>2. How We Use Your Information</h2>
            <p className={prose}>We use collected information to:</p>
            <ul className={list}>
              <li>Provide, maintain, and improve the Loop platform.</li>
              <li>Process transactions and manage your subscription.</li>
              <li>
                Send service-related communications (e.g. security alerts,
                billing updates).
              </li>
              <li>
                Analyze usage patterns to improve product quality and
                reliability.
              </li>
            </ul>

            <h2 className={sectionHeading}>3. Data Sharing</h2>
            <p className={prose}>
              We do not sell your personal data. We share information only with
              service providers necessary to operate Loop (e.g. hosting,
              authentication, payment processing) and when required by law.
            </p>

            <h2 className={sectionHeading}>4. Data Retention</h2>
            <p className={prose}>
              We retain your data for as long as your account is active or as
              needed to provide services. You may request deletion of your
              account and associated data at any time by contacting us.
            </p>

            <h2 className={sectionHeading}>5. Security</h2>
            <p className={prose}>
              We implement industry-standard security measures to protect your
              data, including encryption in transit (TLS) and at rest. However,
              no method of transmission or storage is 100% secure.
            </p>

            <h2 className={sectionHeading}>6. Cookies</h2>
            <p className={prose}>
              Loop uses essential cookies for authentication and session
              management. We also use analytics tools (Vercel Analytics) to
              understand aggregate usage. You can control cookie preferences
              through your browser settings.
            </p>

            <h2 className={sectionHeading}>7. Your Rights</h2>
            <p className={prose}>
              Depending on your jurisdiction, you may have the right to access,
              correct, delete, or export your personal data. To exercise these
              rights, contact us at the email below.
            </p>

            <h2 className={sectionHeading}>8. Changes to This Policy</h2>
            <p className={prose}>
              We may update this policy from time to time. Material changes will
              be communicated via email or an in-app notice. Continued use of
              Loop after changes constitutes acceptance.
            </p>

            <h2 className={sectionHeading}>9. Contact</h2>
            <p className={prose}>
              Questions about this privacy policy? Reach out at{" "}
              <a href="mailto:k.bowen.liu@gmail.com">k.bowen.liu@gmail.com</a>.
            </p>
          </article>
        </div>
      </PageShell>
    </AppGridShell>
  );
}
