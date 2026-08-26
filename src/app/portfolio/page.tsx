import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { getPortfolioItems } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected work by Stephen Rudge — travel writing, photography, and projects from the road.",
};

export default function PortfolioPage() {
  const items = getPortfolioItems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-14 max-w-2xl">
        <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Portfolio
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          A selection of travel writing, photography, and other work — more
          pieces added as projects ship.
        </p>
      </div>

      <PortfolioGrid items={items} />
    </div>
  );
}
