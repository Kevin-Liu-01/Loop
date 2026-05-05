"use client";

import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { GitHubIcon, GITHUB_REPO_URL } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";

const GITHUB_API_URL = "https://api.github.com/repos/Kevin-Liu-01/Loop";

let cachedStars: number | null = null;

interface GitHubStarLinkProps {
  className?: string;
}

export function GitHubStarLink({ className }: GitHubStarLinkProps) {
  const [stars, setStars] = useState<number | null>(cachedStars);

  useEffect(() => {
    if (cachedStars !== null) {
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(GITHUB_API_URL, { signal: controller.signal });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { stargazers_count?: number };
        if (typeof data.stargazers_count === "number") {
          cachedStars = data.stargazers_count;
          setStars(data.stargazers_count);
        }
      } catch {
        // network/abort/parse failures are silent — the link still works
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return (
    <a
      aria-label={
        stars !== null
          ? `Star Loop on GitHub (${stars} stars)`
          : "View Loop on GitHub"
      }
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-none border border-line px-2.5 text-[0.75rem] font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink",
        className
      )}
      href={GITHUB_REPO_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      <GitHubIcon className="h-3.5 w-3.5" />
      {stars !== null ? (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <StarIcon className="h-3 w-3 fill-current" />
          {stars}
        </span>
      ) : (
        <span>GitHub</span>
      )}
    </a>
  );
}
