import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  PageHeader,
  PageHeaderLead,
  PageHeaderSub,
  PageHeaderTitle,
} from "@/components/ui/page-header";
import { buildPageMetadata } from "@/lib/seo";

const TITLE = "Terms of Service";
const DESCRIPTION =
  "Terms and conditions governing your use of the Loop platform.";
const EFFECTIVE_DATE = "April 27, 2026";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/terms",
});

const sectionHeading =
  "mt-10 mb-3 text-lg font-semibold tracking-tight first:mt-0";
const prose = "text-sm leading-relaxed text-ink-muted [&_a]:underline";
const list =
  "mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-muted";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader variant="landing" />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 pt-12 pb-20 max-md:px-5 max-md:pt-8">
        <PageHeader>
          <PageHeaderLead>
            <PageHeaderTitle>{TITLE}</PageHeaderTitle>
            <PageHeaderSub>Effective {EFFECTIVE_DATE}</PageHeaderSub>
          </PageHeaderLead>
        </PageHeader>

        <article className="mt-10 max-w-[68ch]">
          <h2 className={sectionHeading}>1. Acceptance of Terms</h2>
          <p className={prose}>
            By accessing or using Loop, you agree to be bound by these Terms of
            Service. If you do not agree, do not use the platform.
          </p>

          <h2 className={sectionHeading}>2. Description of Service</h2>
          <p className={prose}>
            Loop is an operator desk for agent skills. We provide tools for
            creating, managing, refreshing, and automating source-backed skills,
            MCP servers, and related workflows.
          </p>

          <h2 className={sectionHeading}>3. Accounts</h2>
          <p className={prose}>
            You are responsible for maintaining the security of your account
            credentials and for all activity under your account. You must
            provide accurate information when creating an account and notify us
            promptly of any unauthorized access.
          </p>

          <h2 className={sectionHeading}>4. Acceptable Use</h2>
          <p className={prose}>You agree not to:</p>
          <ul className={list}>
            <li>
              Use Loop for any unlawful purpose or in violation of any
              applicable law.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the service or
              its systems.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              platform.
            </li>
            <li>
              Reverse-engineer, decompile, or disassemble any part of the
              service.
            </li>
            <li>
              Use automated means to scrape or extract data beyond normal API
              usage.
            </li>
          </ul>

          <h2 className={sectionHeading}>5. Intellectual Property</h2>
          <p className={prose}>
            You retain ownership of content you create on Loop, including skills
            and automations. Loop retains all rights to the platform, its
            design, and underlying technology. You grant Loop a limited license
            to host and display your content as needed to operate the service.
          </p>

          <h2 className={sectionHeading}>6. Subscriptions &amp; Billing</h2>
          <p className={prose}>
            Paid features are billed on a recurring basis through Stripe.
            Subscriptions renew automatically unless cancelled before the next
            billing cycle. Refunds are handled on a case-by-case basis.
          </p>

          <h2 className={sectionHeading}>7. Termination</h2>
          <p className={prose}>
            We may suspend or terminate your account if you violate these terms.
            You may delete your account at any time. Upon termination, your
            right to use the service ceases immediately.
          </p>

          <h2 className={sectionHeading}>8. Disclaimers</h2>
          <p className={prose}>
            Loop is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            without warranties of any kind, express or implied. We do not
            guarantee that the service will be uninterrupted, error-free, or
            secure at all times.
          </p>

          <h2 className={sectionHeading}>9. Limitation of Liability</h2>
          <p className={prose}>
            To the maximum extent permitted by law, Loop and its operators shall
            not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the service.
          </p>

          <h2 className={sectionHeading}>10. Changes to Terms</h2>
          <p className={prose}>
            We reserve the right to modify these terms at any time. Material
            changes will be communicated via email or in-app notice at least 14
            days before taking effect. Continued use constitutes acceptance.
          </p>

          <h2 className={sectionHeading}>11. Governing Law</h2>
          <p className={prose}>
            These terms are governed by the laws of the State of California,
            United States, without regard to conflict-of-law principles.
          </p>

          <h2 className={sectionHeading}>12. Contact</h2>
          <p className={prose}>
            Questions about these terms? Reach out at{" "}
            <a href="mailto:k.bowen.liu@gmail.com">k.bowen.liu@gmail.com</a>.
          </p>
        </article>
      </main>
      <SiteFooter narrow />
    </div>
  );
}
