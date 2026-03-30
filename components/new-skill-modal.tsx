"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth, SignInButton } from "@clerk/nextjs";

import { DownloadIcon, PencilIcon } from "@/components/frontier-icons";
import { ImportSkillForm } from "@/components/import-skill-form";
import { UserSkillForm } from "@/components/user-skill-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/shadcn/tabs";
import type { CategoryDefinition } from "@/lib/types";

type NewSkillModalProps = {
  categories: CategoryDefinition[];
};

export function NewSkillModal({ categories }: NewSkillModalProps) {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.addEventListener("loop:open-new-skill", handleOpen);
    return () => window.removeEventListener("loop:open-new-skill", handleOpen);
  }, [handleOpen]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="gap-0 overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription>
            Import from a URL or draft a custom skill. Operators can manage both in one place.
          </DialogDescription>
        </DialogHeader>
        {!isSignedIn ? (
          <div className="grid gap-4 px-6 py-8 text-center">
            <p className="text-sm text-ink-soft">
              Sign in with an Operator subscription to create or import skills.
            </p>
            <SignInButton mode="modal">
              <Button type="button">Sign in</Button>
            </SignInButton>
          </div>
        ) : (
          <Tabs defaultValue="import" className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList className="mx-6 mt-4 w-fit shrink-0">
              <TabsTrigger value="import" className="gap-1.5">
                <DownloadIcon className="h-3.5 w-3.5" />
                Import URL
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-1.5">
                <PencilIcon className="h-3.5 w-3.5" />
                Create new
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="px-6 pb-6 pt-2">
                  <ImportSkillForm />
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="create" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="px-6 pb-6 pt-2">
                  <UserSkillForm categories={categories} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
