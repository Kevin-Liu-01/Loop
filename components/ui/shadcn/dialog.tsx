"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/cn";
import {
  modalDialogContentSurface,
  modalDialogOverlay,
} from "@/lib/modal-dialog";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      modalDialogOverlay,
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150",
      "motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  }
>(({ className, children, maxWidth = "xl", ...props }, ref) => {
  const maxWidthMap: Record<string, string> = {
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-[calc(100vw-2rem)]",
    lg: "max-w-lg",
    md: "max-w-md",
    sm: "max-w-sm",
    xl: "max-w-xl",
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 max-h-[min(92vh,calc(100dvh-2rem))] max-sm:max-h-[min(94vh,calc(100dvh-1rem))]",
          "flex flex-col gap-0 overflow-hidden backdrop-blur-[1px]",
          modalDialogContentSurface,
          "origin-center data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:duration-200",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:duration-150",
          "motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none",
          maxWidthMap[maxWidth],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="dialog-close absolute right-5 top-5 z-10 grid h-8 w-8 cursor-pointer place-items-center rounded-none border border-line/70 bg-paper-3/90 text-ink-soft shadow-sm backdrop-blur-sm transition-[color,background-color,border-color,box-shadow] hover:border-accent/35 hover:bg-paper-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:bg-paper-2/90">
          <XIcon className="h-3.5 w-3.5 stroke-[1.5]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative shrink-0 flex flex-col items-start gap-1 border-b border-line/80 bg-linear-to-b from-paper-2/50 to-transparent px-6 py-5 pr-14 text-left dark:from-paper-2/30",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-end gap-2 border-t border-line/80 bg-paper-2/20 px-6 py-4 dark:bg-paper-2/15",
        className
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "m-0 font-serif text-xl font-medium tracking-[-0.02em] text-balance text-ink",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-pretty text-sm leading-relaxed text-ink-soft",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
