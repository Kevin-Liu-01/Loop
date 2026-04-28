"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  AutomationIcon,
  CheckIcon,
  ClockIcon,
  RefreshIcon,
  SearchIcon,
  SparkIcon,
} from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "loop:onboarding-seen";
const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000;

type Step = 0 | 1 | 2;

export function WelcomeModal() {
  const { isSignedIn, user } = useUser();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);

  useEffect(() => {
    if (!isSignedIn || !user) {
      return;
    }

    const accountAge = Date.now() - (user.createdAt?.getTime() ?? 0);
    if (accountAge > NEW_ACCOUNT_WINDOW_MS) {
      return;
    }

    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      // SSR or storage blocked
    }
  }, [isSignedIn, user]);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage blocked
    }
  }, []);

  const next = useCallback(() => {
    setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  }, []);

  const back = useCallback(() => {
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }, []);

  const openNewSkill = useCallback(() => {
    dismiss();
    window.dispatchEvent(new CustomEvent("loop:open-new-skill"));
  }, [dismiss]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <Dialog onOpenChange={(v) => !v && dismiss()} open={open}>
      <DialogContent className="gap-0 overflow-hidden p-0" maxWidth="md">
        <DialogHeader>
          <Badge color="orange" size="sm">
            {step === 0
              ? "Welcome"
              : step === 1
                ? "Step 1 of 2"
                : "Step 2 of 2"}
          </Badge>
          <DialogTitle>
            {step === 0 && "Welcome to Loop"}
            {step === 1 && "Create your first skill"}
            {step === 2 && "Set up automation"}
          </DialogTitle>
          <DialogDescription>
            {step === 0 &&
              "Loop keeps your agent playbooks sharp. Create skills, attach sources, and let automations keep everything current."}
            {step === 1 &&
              "A skill is a knowledge document your AI agents use. Create one from scratch, import from a URL, or fork an existing skill from the catalog."}
            {step === 2 &&
              "Automations refresh your skills on a schedule. The agent scans sources, detects changes, and publishes a new version automatically."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepCreateSkill />}
          {step === 2 && <StepAutomation dismiss={dismiss} />}
        </div>

        <DialogFooter className="justify-between">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === step
                    ? "w-5 bg-accent"
                    : i < step
                      ? "w-1.5 bg-accent/50"
                      : "w-1.5 bg-line-strong"
                )}
                key={i}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button onClick={back} size="sm" type="button" variant="soft">
                Back
              </Button>
            )}
            {step === 0 && (
              <Button onClick={next} size="sm" type="button">
                Get started
              </Button>
            )}
            {step === 1 && (
              <>
                <Button
                  onClick={openNewSkill}
                  size="sm"
                  type="button"
                  variant="soft"
                >
                  <SparkIcon className="h-3.5 w-3.5" />
                  Create a skill now
                </Button>
                <Button onClick={next} size="sm" type="button">
                  Next
                </Button>
              </>
            )}
            {step === 2 && (
              <Button onClick={dismiss} size="sm" type="button">
                <CheckIcon className="h-3.5 w-3.5" />
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepWelcome() {
  return (
    <div className="grid gap-0 px-6 py-5">
      <div className="grid gap-0 overflow-hidden border border-line">
        <FeatureRow
          icon={<SparkIcon className="h-4 w-4" />}
          title="Skills"
          description="Markdown knowledge docs your agents consume. Track sources so content stays accurate."
          border
        />
        <FeatureRow
          icon={<AutomationIcon className="h-4 w-4" />}
          title="Automations"
          description="Scheduled refreshes that scan sources and publish new versions without manual work."
        />
      </div>
    </div>
  );
}

function StepCreateSkill() {
  return (
    <div className="grid gap-4 px-6 py-5">
      <div className="grid gap-0 overflow-hidden border border-line">
        {[
          {
            icon: <SparkIcon className="h-3.5 w-3.5" />,
            label: "Create from scratch",
            desc: "Write a new skill with your own content and sources",
          },
          {
            icon: <SearchIcon className="h-3.5 w-3.5" />,
            label: "Import from URL",
            desc: "Pull in an existing SKILL.md from any public URL",
          },
          {
            icon: <RefreshIcon className="h-3.5 w-3.5" />,
            label: "Fork from catalog",
            desc: "Copy a community skill and make it yours to customize",
          },
        ].map((item, i) => (
          <div
            className="flex items-center gap-3.5 border-b border-line/60 bg-paper-3/60 px-4 py-3.5 last:border-b-0 dark:bg-paper-2/40"
            key={item.label}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-paper-2/80 text-ink-faint dark:bg-paper-3/50">
              {item.icon}
            </span>
            <div className="grid gap-0.5">
              <strong className="text-[0.8125rem] font-semibold text-ink">
                {item.label}
              </strong>
              <span className="text-xs leading-relaxed text-ink-soft">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepAutomation({ dismiss }: { dismiss: () => void }) {
  return (
    <div className="grid gap-4 px-6 py-5">
      <div className="grid grid-cols-3 gap-0 overflow-hidden border border-line">
        {[
          {
            icon: <RefreshIcon className="h-3.5 w-3.5" />,
            label: "Daily",
            desc: "Every day at your preferred hour",
          },
          {
            icon: <ClockIcon className="h-3.5 w-3.5" />,
            label: "Weekly",
            desc: "Once a week on your chosen day",
          },
          {
            icon: <SparkIcon className="h-3.5 w-3.5" />,
            label: "Manual",
            desc: "Only when you trigger it",
          },
        ].map((item) => (
          <div
            className="grid place-items-center gap-2 border-r border-line/60 bg-paper-3/60 px-3 py-4 text-center last:border-r-0 dark:bg-paper-2/40"
            key={item.label}
          >
            <span className="flex h-7 w-7 items-center justify-center border border-line bg-paper-2/80 text-ink-faint dark:bg-paper-3/50">
              {item.icon}
            </span>
            <div className="grid gap-0.5">
              <strong className="text-[0.8125rem] font-semibold text-ink">
                {item.label}
              </strong>
              <span className="text-[0.6875rem] leading-relaxed text-ink-soft">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="m-0 text-[0.8125rem] leading-relaxed text-ink-soft">
        Configure automation from any skill page under the Activity section, or
        from the{" "}
        <Link
          className="font-medium text-ink underline underline-offset-2 hover:text-accent"
          href="/settings/automations"
          onClick={dismiss}
        >
          Automation desk
        </Link>
        .
      </p>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  description,
  border,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  border?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 bg-paper-3/60 px-4 py-4 dark:bg-paper-2/40",
        border && "border-b border-line/60"
      )}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-accent/25 bg-accent/8 text-accent">
        {icon}
      </span>
      <div className="grid gap-1">
        <strong className="text-[0.8125rem] font-semibold text-ink">
          {title}
        </strong>
        <span className="text-[0.8125rem] leading-relaxed text-ink-soft">
          {description}
        </span>
      </div>
    </div>
  );
}
