import { BrandAssetsPanel } from "@/components/brand-assets-panel";
import { SettingsSectionPage } from "@/components/settings-section-page";

export default function SettingsBrandingPage() {
  return (
    <SettingsSectionPage sectionId="branding">
      <BrandAssetsPanel />
    </SettingsSectionPage>
  );
}
