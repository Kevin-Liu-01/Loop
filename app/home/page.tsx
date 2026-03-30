import type { Metadata } from "next";
import { LandingShell } from "@/components/home-landing/landing-shell";

export const metadata: Metadata = {
  title: "Loop — Skills that never go stale",
  description:
    "Loop monitors, evaluates, and updates your agent playbooks. Every skill stays optimal, every parameter stays current.",
};

export default function HomePage() {
  return <LandingShell />;
}
