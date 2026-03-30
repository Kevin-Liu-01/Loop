import { cn } from "@/lib/cn";

type PageShellProps = {
  narrow?: boolean;
  /**
   * Inside AppGridShell: full width, no outer padding (use inner wrappers).
   * Fills space above the global footer when paired with flex-1.
   */
  inset?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function PageShell({ narrow, inset, className, children, ...rest }: PageShellProps) {
  return (
    <main
      className={cn(
        !inset &&
          "mx-auto w-[min(1180px,calc(100vw-32px))] pt-22 pb-18 max-md:w-[min(100vw-20px,1180px)] max-md:pt-21 max-md:pb-14",
        inset &&
          "flex min-h-0 min-w-0 w-full flex-1 flex-col p-0",
        narrow && !inset && "w-[min(1180px,calc(100vw-32px))]",
        className
      )}
      {...rest}
    >
      {children}
    </main>
  );
}
