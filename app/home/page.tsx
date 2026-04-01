import type { Metadata } from "next";
import { LandingShell } from "@/components/home-landing/landing-shell";
import { fetchLandingData } from "@/lib/home-landing/landing-queries";
import {
  LANDING_AUTOMATIONS,
  LANDING_MCPS,
  LANDING_SKILLS,
} from "@/lib/home-landing/landing-data";
import {
  buildDefaultOpenGraphImages,
  buildDefaultTwitterImageUrls,
  buildSiteUrl,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SITE_NAME,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const LANDING_DESCRIPTION =
  "Loop monitors, evaluates, and updates your agent playbooks. Every skill stays optimal, every parameter stays current.";

export const metadata: Metadata = {
  title: SEO_DEFAULT_TITLE,
  description: LANDING_DESCRIPTION,
  openGraph: {
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    url: buildSiteUrl("/").toString(),
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: buildDefaultOpenGraphImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    images: buildDefaultTwitterImageUrls(),
  },
};

export default async function HomePage() {
  const live = await fetchLandingData().catch(() => null);
  const hasLiveSkills = live && live.skills.length > 0;

  return (
    <LandingShell
      automations={hasLiveSkills ? live.automations : LANDING_AUTOMATIONS}
      mcps={hasLiveSkills ? live.mcps : LANDING_MCPS}
      skills={hasLiveSkills ? live.skills : undefined}
      staticSkills={hasLiveSkills ? undefined : LANDING_SKILLS}
    />
  );
}
