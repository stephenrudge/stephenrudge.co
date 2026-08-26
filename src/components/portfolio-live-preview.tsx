"use client";

import { ExternalLink } from "lucide-react";

export function PortfolioLivePreview({
  title,
  demoUrl,
  demoReachable,
}: {
  title: string;
  demoUrl: string;
  demoReachable: boolean;
}) {
  if (!demoReachable) {
    return (
      <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-800">
        <div className="bg-zinc-50 px-6 py-16 text-center dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            Demo server isn&apos;t running
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Run{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">
              npm run portfolio:hearth
            </code>{" "}
            from this repo to rebuild the bundled demo, then refresh.
          </p>
          <pre className="mx-auto mt-4 max-w-lg overflow-x-auto rounded-md bg-zinc-900 px-4 py-3 text-left text-xs text-zinc-100">
            npm run portfolio:hearth
          </pre>
        </div>
        <p className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950/50">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Open full site in a new tab
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-800">
      <iframe
        title={`${title} live preview`}
        src={demoUrl}
        className="h-[min(80vh,900px)] w-full bg-white"
        loading="lazy"
      />
      <p className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          Open full site in a new tab
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </p>
    </div>
  );
}
