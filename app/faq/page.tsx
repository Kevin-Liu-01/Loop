import type { Metadata } from "next";

import { FaqShell } from "@/components/faq-shell";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  PageHeader,
  PageHeaderLead,
  PageHeaderSub,
  PageHeaderTitle,
} from "@/components/ui/page-header";
import { FAQ_SECTIONS } from "@/lib/faq-data";
import { buildFaqPageJsonLd, buildPageMetadata } from "@/lib/seo";

const FAQ_TITLE = "FAQ";
const FAQ_DESCRIPTION =
  "Frequently asked questions about Loop – the operator desk for source-backed agent skills.";

export const metadata: Metadata = buildPageMetadata({
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  path: "/faq",
});

export default function FaqPage() {
  const allItems = FAQ_SECTIONS.flatMap((s) => s.items);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SeoJsonLd data={buildFaqPageJsonLd(allItems)} />
      <SiteHeader variant="landing" />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 pt-12 pb-20 max-md:px-5 max-md:pt-8">
        <PageHeader>
          <PageHeaderLead>
            <PageHeaderTitle>Frequently asked questions</PageHeaderTitle>
            <PageHeaderSub>
              Everything you need to know about Loop, from source-backed skills
              and automations to the refresh engine and why it is built the way
              it is.
            </PageHeaderSub>
          </PageHeaderLead>
        </PageHeader>

        <div className="mt-10">
          <FaqShell sections={FAQ_SECTIONS} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
