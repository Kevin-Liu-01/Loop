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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Skill</DialogTitle>
        </DialogHeader>
        {!isSignedIn ? (
          <div className="grid gap-4 p-5 text-center">
            <p className="text-sm text-ink-soft">
              Sign in with an Operator subscription to create or import skills.
            </p>
            <SignInButton mode="modal">
              <Button type="button">Sign in</Button>
            </SignInButton>
          </div>
        ) : (
          <Tabs defaultValue="import" className="grid gap-0">
            <TabsList className="mx-5 mt-1 w-fit">
              <TabsTrigger value="import" className="gap-1.5">
                <DownloadIcon className="h-3.5 w-3.5" />
                Import URL
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-1.5">
                <PencilIcon className="h-3.5 w-3.5" />
                Create new
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="mt-0">
              <ScrollArea className="max-h-[60vh]">
                <div className="p-5">
                  <ImportSkillForm />
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="create" className="mt-0">
              <ScrollArea className="max-h-[60vh]">
                <div className="p-5">
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
