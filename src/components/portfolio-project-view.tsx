import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PortfolioLivePreview } from "@/components/portfolio-live-preview";
import type { PortfolioItem } from "@/types/portfolio";

export function PortfolioProjectView({
  item,
  demoUrl,
  demoReachable,
}: {
  item: PortfolioItem;
  demoUrl: string;
  demoReachable: boolean;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Link
        href="/portfolio"
        className="text-sm text-zinc-500 transition-colors hover:text-accent dark:text-zinc-400"
      >
        ← Portfolio
      </Link>

      <header className="mt-8 max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {item.category ? (
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 dark:border-zinc-700">
              {item.category}
            </span>
          ) : null}
          {item.year ? <span>{item.year}</span> : null}
        </div>
        <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {item.longDescription || item.description}
        </p>
        {item.stack?.length ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {item.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
        {item.externalUrl ? (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            View repository
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </header>

      <section className="mt-14">
        <h2 className="mb-4 font-serif text-2xl text-zinc-900 dark:text-zinc-50">
          Live preview
        </h2>
        {demoUrl ? (
          <PortfolioLivePreview
            title={item.title}
            demoUrl={demoUrl}
            demoReachable={demoReachable}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-zinc-600 dark:text-zinc-400">
              Demo URL not configured yet. Set{" "}
              <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
                NEXT_PUBLIC_HEARTH_EMBER_DEMO_URL
              </code>{" "}
              to the deployed Hearth &amp; Ember site (or{" "}
              <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
                http://localhost:3001
              </code>{" "}
              while developing locally).
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
