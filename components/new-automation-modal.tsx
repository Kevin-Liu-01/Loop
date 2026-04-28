"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { SearchIcon } from "@/components/frontier-icons";
import { SkillInline } from "@/components/skill-inline";
import { Badge } from "@/components/ui/badge";
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
import { SkillIcon } from "@/components/ui/skill-icon";
import { StatusDot } from "@/components/ui/status-dot";
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
  const { userId } = useAuth();
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
  const [skillQuery, setSkillQuery] = useState("");
  const deferredQuery = useDeferredValue(skillQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  const skillMap = useMemo(
    () => new Map(manageableSkills.map((s) => [s.slug, s])),
    [manageableSkills]
  );

  const ownSkills = useMemo(
    () =>
      userId
        ? manageableSkills.filter((s) => s.creatorClerkUserId === userId)
        : [],
    [manageableSkills, userId]
  );
  const ownSlugs = useMemo(
    () => new Set(ownSkills.map((s) => s.slug)),
    [ownSkills]
  );
  const otherSkills = useMemo(
    () => manageableSkills.filter((s) => !ownSlugs.has(s.slug)),
    [manageableSkills, ownSlugs]
  );

  const filterSkills = useCallback(
    (list: SkillRecord[]) => {
      if (!deferredQuery.trim()) {
        return list;
      }
      const q = deferredQuery.toLowerCase();
      return list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    },
    [deferredQuery]
  );

  const filteredOwn = useMemo(
    () => filterSkills(ownSkills),
    [filterSkills, ownSkills]
  );
  const filteredOther = useMemo(
    () => filterSkills(otherSkills),
    [filterSkills, otherSkills]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const nextSkill = ownSkills[0] ?? manageableSkills[0];
    setSelectedSkillSlug(nextSkill?.slug ?? "");
    setName(nextSkill ? `${nextSkill.title} refresh` : "");
    setNote("");
    setSkillQuery("");
    setMessage(null);
    setError(null);
  }, [open, manageableSkills, ownSkills]);

  function handleSkillSelect(slug: string) {
    setSelectedSkillSlug(slug);
    const skill = skillMap.get(slug);
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

  const selectedSkill = skillMap.get(selectedSkillSlug);

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
              ) : (
                <FieldGroup>
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
                    Skill
                  </span>

                  {/* Search */}
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      ref={searchRef}
                      className={cn(textFieldBase, "pl-9 text-sm")}
                      onChange={(e) => setSkillQuery(e.target.value)}
                      placeholder="Search skills..."
                      value={skillQuery}
                    />
                  </div>

                  {/* Skill list */}
                  <div className="grid gap-0 overflow-hidden border border-line max-h-[200px] overflow-y-auto">
                    {filteredOwn.length > 0 && (
                      <>
                        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line/40 bg-paper-2/80 px-3 py-1.5 backdrop-blur-sm dark:bg-paper-2/60">
                          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                            Your skills
                          </span>
                          <span className="text-[0.625rem] tabular-nums text-ink-faint/60">
                            {filteredOwn.length}
                          </span>
                        </div>
                        {filteredOwn.map((skill) => (
                          <SkillPickerRow
                            key={skill.slug}
                            onClick={() => handleSkillSelect(skill.slug)}
                            selected={selectedSkillSlug === skill.slug}
                            skill={skill}
                          />
                        ))}
                      </>
                    )}
                    {filteredOther.length > 0 && (
                      <>
                        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line/40 bg-paper-2/80 px-3 py-1.5 backdrop-blur-sm dark:bg-paper-2/60">
                          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                            {filteredOwn.length > 0
                              ? "Other skills"
                              : "All skills"}
                          </span>
                          <span className="text-[0.625rem] tabular-nums text-ink-faint/60">
                            {filteredOther.length}
                          </span>
                        </div>
                        {filteredOther.map((skill) => (
                          <SkillPickerRow
                            key={skill.slug}
                            onClick={() => handleSkillSelect(skill.slug)}
                            selected={selectedSkillSlug === skill.slug}
                            skill={skill}
                          />
                        ))}
                      </>
                    )}
                    {filteredOwn.length === 0 && filteredOther.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-ink-faint">
                        No skills match "{deferredQuery}"
                      </div>
                    )}
                  </div>

                  {/* Selected preview */}
                  {selectedSkill && (
                    <div className="flex items-start gap-3 border border-accent/20 bg-accent/4 px-3 py-2.5">
                      <SkillInline
                        category={selectedSkill.category}
                        iconUrl={selectedSkill.iconUrl}
                        slug={selectedSkill.slug}
                        title={selectedSkill.title}
                        versionLabel={selectedSkill.versionLabel}
                      />
                      {selectedSkill.description ? (
                        <p className="m-0 hidden line-clamp-1 text-xs text-ink-soft sm:block">
                          {selectedSkill.description}
                        </p>
                      ) : null}
                    </div>
                  )}
                </FieldGroup>
              )}

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

function SkillPickerRow({
  skill,
  selected,
  onClick,
}: {
  skill: SkillRecord;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 border-t border-line/40 px-3 py-2 text-left transition-colors first:border-t-0",
        selected
          ? "bg-accent/8"
          : "hover:bg-paper-2/50 dark:hover:bg-paper-3/40"
      )}
      onClick={onClick}
      type="button"
    >
      <SkillIcon
        className="shrink-0 rounded-md"
        iconUrl={skill.iconUrl}
        size={22}
        slug={skill.slug}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {selected && <StatusDot size="xs" tone="fresh" />}
          <span
            className={cn(
              "truncate text-sm",
              selected ? "font-semibold text-ink" : "font-medium text-ink"
            )}
          >
            {skill.title}
          </span>
          <Badge color="neutral" size="sm">
            {skill.versionLabel}
          </Badge>
        </div>
      </div>
    </button>
  );
}
