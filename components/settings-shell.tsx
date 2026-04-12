import { SettingsNavSidebar } from "@/components/settings-nav-sidebar";
import { cn } from "@/lib/cn";
import { pageInsetPadX } from "@/lib/ui-layout";

interface SettingsShellProps {
  children: React.ReactNode;
}

/**
 * Sidebar + main column for settings routes (`/settings/*`).
 */
export function SettingsShell({ children }: SettingsShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <SettingsNavSidebar />

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col gap-10 overflow-y-auto pb-20",
          pageInsetPadX,
          "py-6 sm:py-8"
        )}
      >
        {children}
      </div>
    </div>
  );
}
