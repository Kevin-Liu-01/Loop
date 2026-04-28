"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { SkillInline } from "@/components/skill-inline";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  textFieldBase,
  textFieldArea,
} from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
  CADENCE_ALL_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/automation-constants";
import { cn } from "@/lib/cn";
import type { SkillRecord, UserSkillCadence } from "@/lib/types";

interface NewAutomationModalProps {
  skills: SkillRecord[];
}

export function NewAutomationModal({ skills }: NewAutomationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.addEventListener("loop:open-new-automation", handleOpen);
    return () =>
      window.removeEventListener("loop:open-new-automation", handleOpen);
  }, [handleOpen]);

  const manageableSkills = useMemo(
    () => skills.filter((s) => s.origin === "user"),
    [skills]
  );

  const [selectedSkillSlug, setSelectedSkillSlug] = useState(
    manageableSkills[0]?.slug ?? ""
  );
  const [name, setName] = useState(
    manageableSkills[0] ? `${manageableSkills[0].title} refresh` : ""
  );
  const [note, setNote] = useState("");
  const [cadence, setCadence] = useState<UserSkillCadence>("daily");
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const skillMap = useMemo(
    () => new Map(manageableSkills.map((s) => [s.slug, s])),
    [manageableSkills]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const nextSkill = manageableSkills[0];
    setSelectedSkillSlug(nextSkill?.slug ?? "");
    setName(nextSkill ? `${nextSkill.title} refresh` : "");
    setNote("");
    setMessage(null);
    setError(null);
  }, [open, manageableSkills]);

  function handleSkillChange(nextSlug: string) {
    setSelectedSkillSlug(nextSlug);
    const skill = skillMap.get(nextSlug);
    if (skill) {
      setName(`${skill.title} refresh`);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/automations", {
        body: JSON.stringify({
          cadence,
          name,
          note,
          skillSlug: selectedSkillSlug,
          status,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Unable to create automation.");
        return;
      }

      const skill = skillMap.get(selectedSkillSlug);
      setMessage(
        `${payload.id ?? "automation"} created${skill ? ` for ${skill.title}` : ""}.`
      );
      setNote("");
      router.refresh();
      setTimeout(() => handleClose(), 1200);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose();
        }
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0" maxWidth="lg">
        <DialogHeader>
          <DialogTitle>New automation</DialogTitle>
          <DialogDescription>
            {manageableSkills.length > 0
              ? "Pick a skill you own, set a cadence, and add a short instruction for each run."
              : "You do not currently own any skills with editable automation."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col gap-0"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="grid gap-5">
              {manageableSkills.length === 0 ? (
                <div className="border border-line bg-paper-2/60 px-4 py-3 text-sm text-ink-soft">
                  Track a skill or create one to set up automation.
                </div>
              ) : null}
              <FieldGroup>
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
                  Skill
                </span>
                <Select
                  disabled={manageableSkills.length === 0}
                  onChange={handleSkillChange}
                  options={manageableSkills.map((skill) => ({
                    label: skill.title,
                    value: skill.slug,
                  }))}
                  value={selectedSkillSlug}
                />
                {(() => {
                  const selected = skillMap.get(selectedSkillSlug);
                  if (!selected) {
                    return null;
                  }
                  return (
                    <div className="flex items-start gap-3 border border-line bg-paper-2/40 px-3 py-2.5">
                      <SkillInline
                        category={selected.category}
                        iconUrl={selected.iconUrl}
                        slug={selected.slug}
                        title={selected.title}
                        versionLabel={selected.versionLabel}
                      />
                      {selected.description ? (
                        <p className="m-0 hidden line-clamp-1 text-xs text-ink-soft sm:block">
                          {selected.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })()}
              </FieldGroup>

              <FieldGroup>
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
                  Name
                </span>
                <input
                  className={cn(textFieldBase)}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Frontend refresh"
                  required
                  value={name}
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <FieldGroup>
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
                    Schedule
                  </span>
                  <Select
                    onChange={(v) => setCadence(v as UserSkillCadence)}
                    options={CADENCE_ALL_OPTIONS}
                    value={cadence}
                  />
                </FieldGroup>

                <FieldGroup>
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
                    Status
                  </span>
                  <Select
                    onChange={(v) => setStatus(v as "ACTIVE" | "PAUSED")}
                    options={STATUS_OPTIONS.map((o) => ({
                      label: o.label,
                      value: o.value,
                    }))}
                    value={status}
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
                  Instruction
                </span>
                <textarea
                  className={cn(textFieldBase, textFieldArea)}
                  maxLength={240}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What should this run look for?"
                  value={note}
                />
              </FieldGroup>

              {error && <p className="text-sm text-danger">{error}</p>}
              {message && <p className="text-sm text-success">{message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleClose}
              type="button"
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              disabled={
                isPending || !selectedSkillSlug || manageableSkills.length === 0
              }
              size="sm"
              type="submit"
            >
              {isPending ? "Creating..." : "Create automation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
