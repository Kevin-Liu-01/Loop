import Link from "next/link";

import { GITHUB_REPO_URL, GitHubIcon } from "@/components/frontier-icons";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="shrink-0 border-t border-line bg-paper/95 px-4 py-3 text-xs text-ink-soft backdrop-blur-xl dark:bg-paper/88"
      role="contentinfo"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 font-medium tabular-nums text-ink-faint">
          © {year} Loop · Operator desk for agent skills
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link className="text-ink-soft transition-colors hover:text-ink" href="/">
            Skills
          </Link>
          <Link className="text-ink-soft transition-colors hover:text-ink" href="/sandbox">
            Sandbox
          </Link>
          <Link className="text-ink-soft transition-colors hover:text-ink" href="/settings">
            Settings
          </Link>
          <Link className="text-ink-soft transition-colors hover:text-ink" href="/faq">
            FAQ
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
