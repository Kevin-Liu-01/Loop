import { SettingsSectionPage } from "@/components/settings-section-page";
import { TimezonePicker } from "@/components/timezone-picker";

export default function SettingsPreferencesPage() {
  return (
    <SettingsSectionPage sectionId="preferences">
      <TimezonePicker />
    </SettingsSectionPage>
  );
}
