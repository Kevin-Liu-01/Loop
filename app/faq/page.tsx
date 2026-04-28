import type { Metadata } from "next";

import { AppGridShell } from "@/components/app-grid-shell";
import { FaqShell } from "@/components/faq-shell";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { SiteHeader } from "@/components/site-header";
import {
  PageHeader,
  PageHeaderLead,
  PageHeaderSub,
  PageHeaderTitle,
} from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { FAQ_SECTIONS } from "@/lib/faq-data";
import {
  buildDefaultOpenGraphImages,
  buildDefaultTwitterImages,
  buildFaqPageJsonLd,
  buildSiteUrl,
  SITE_NAME,
  TWITTER_CREATOR_HANDLE,
  TWITTER_SITE_HANDLE,
} from "@/lib/seo";
import { pageInsetColumnClass } from "@/lib/ui-layout";

const FAQ_TITLE = "FAQ";
const FAQ_DESCRIPTION =
  "Frequently asked questions about Loop – the operator desk for self-updating agent skills.";

export const metadata: Metadata = {
  description: FAQ_DESCRIPTION,
  openGraph: {
    description: FAQ_DESCRIPTION,
    images: buildDefaultOpenGraphImages(),
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${FAQ_TITLE} · ${SITE_NAME}`,
    type: "website",
    url: buildSiteUrl("/faq").toString(),
  },
  title: FAQ_TITLE,
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_CREATOR_HANDLE,
    description: FAQ_DESCRIPTION,
    images: buildDefaultTwitterImages(),
    site: TWITTER_SITE_HANDLE,
    title: `${FAQ_TITLE} · ${SITE_NAME}`,
  },
};

export default function FaqPage() {
  const allItems = FAQ_SECTIONS.flatMap((s) => s.items);

  return (
    <AppGridShell header={<SiteHeader />}>
      <SeoJsonLd data={buildFaqPageJsonLd(allItems)} />
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={pageInsetColumnClass(
            "grid min-h-0 flex-1 gap-8 overflow-y-auto pb-16"
          )}
        >
          <PageHeader>
            <PageHeaderLead>
              <PageHeaderTitle>Frequently asked questions</PageHeaderTitle>
              <PageHeaderSub>
                Everything you need to know about Loop – from skills and
                automations to billing and the refresh engine.
              </PageHeaderSub>
            </PageHeaderLead>
          </PageHeader>

          <FaqShell sections={FAQ_SECTIONS} />
        </div>
      </PageShell>
    </AppGridShell>
  );
}
