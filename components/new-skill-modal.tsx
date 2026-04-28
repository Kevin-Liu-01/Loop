"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { ExternalSkillSources } from "@/components/external-skill-sources";
import {
  DownloadIcon,
  PencilIcon,
  SearchIcon,
} from "@/components/frontier-icons";
import { ImportSkillForm } from "@/components/import-skill-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/shadcn/tabs";
import { UserSkillForm } from "@/components/user-skill-form";
import type { CategoryDefinition } from "@/lib/types";

interface NewSkillModalProps {
  categories: CategoryDefinition[];
}

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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose();
        }
      }}
    >
      <DialogContent className="h-[min(85vh,calc(100dvh-2rem))] gap-0 overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription>
            Discover, import, or create a skill. Free accounts get up to 3
            automations.
          </DialogDescription>
        </DialogHeader>
        {!isSignedIn ? (
          <div className="grid gap-4 px-6 py-8 text-center">
            <p className="text-sm text-ink-soft">
              Sign in to create or import skills. Your first skill is free.
            </p>
            <SignInButton mode="modal">
              <Button type="button">Sign in</Button>
            </SignInButton>
          </div>
        ) : (
          <Tabs
            defaultValue="discover"
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <TabsList className="mx-6 mt-4 w-fit shrink-0">
              <TabsTrigger value="discover" className="gap-1.5">
                <SearchIcon className="h-3.5 w-3.5" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-1.5">
                <DownloadIcon className="h-3.5 w-3.5" />
                Import URL
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-1.5">
                <PencilIcon className="h-3.5 w-3.5" />
                Create new
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="discover"
              className="mt-0 min-h-0 flex-1 overflow-y-auto"
            >
              <div className="px-6 pb-6 pt-2">
                <ExternalSkillSources onSuccess={handleClose} />
              </div>
            </TabsContent>
            <TabsContent
              value="import"
              className="mt-0 min-h-0 flex-1 overflow-y-auto"
            >
              <div className="px-6 pb-6 pt-2">
                <ImportSkillForm onSuccess={handleClose} />
              </div>
            </TabsContent>
            <TabsContent
              value="create"
              className="mt-0 min-h-0 flex-1 overflow-y-auto"
            >
              <div className="px-6 pb-6 pt-2">
                <UserSkillForm categories={categories} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
