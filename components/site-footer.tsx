import Link from "next/link";

import { GITHUB_REPO_URL, GitHubIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";

interface SiteFooterProps {
  /**
   * When true, the inner content is constrained to `max-w-[1100px]` and
   * centered with `mx-auto` so it lines up with the marketing-layout
   * navbar/main column on landing-style pages (legal, FAQ). The
   * border-t and background still span full viewport width so the
   * floor-line affordance is preserved edge-to-edge.
   *
   * Defaults to `false` — used by `AppGridShell` (in-app pages), where
   * content is full-width and the footer should match.
   */
  narrow?: boolean;
}

export function SiteFooter({ narrow = false }: SiteFooterProps = {}) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "shrink-0 border-t border-line bg-paper/95 py-3 text-xs text-ink-soft backdrop-blur-xl dark:bg-paper/88",
        narrow ? "px-6" : "px-4"
      )}
      role="contentinfo"
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 max-sm:justify-center max-sm:text-center",
          narrow && "mx-auto w-full max-w-[1100px]"
        )}
      >
        <p className="m-0 font-medium tabular-nums text-ink-faint">
          © {year} Loop · Operator desk for agent skills
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-5 gap-y-1 max-sm:justify-center"
        >
          <Link
            className="text-ink-soft transition-colors hover:text-ink"
            href="/"
          >
            Skills
          </Link>
          <Link
            className="text-ink-soft transition-colors hover:text-ink"
            href="/sandbox"
          >
            Sandbox
          </Link>
          <Link
            className="text-ink-soft transition-colors hover:text-ink"
            href="/settings"
          >
            Settings
          </Link>
          <Link
            className="text-ink-soft transition-colors hover:text-ink"
            href="/faq"
          >
            FAQ
          </Link>
          <Link
            className="text-ink-soft transition-colors hover:text-ink"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="text-ink-soft transition-colors hover:text-ink"
            href="/terms"
          >
            Terms
          </Link>
          <a
            className="text-ink-soft transition-colors hover:text-ink"
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <GitHubIcon className="size-3.5" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
