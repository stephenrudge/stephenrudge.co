import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TipSupport({
  url,
  label = "Buy me a coffee",
}: {
  url: string;
  label?: string;
}) {
  return (
    <section className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
      <div className="mb-3 flex items-center gap-2 text-accent">
        <Coffee className="h-5 w-5" aria-hidden />
        <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
          Coffee or gas money
        </h2>
      </div>
      <p className="max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Totally optional — if a story helped you plan a trip, or you just want
        to chip in for a coffee or a tank of gas on the road, I appreciate it.
      </p>
      <Button asChild className="mt-5" variant="outline">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      </Button>
    </section>
  );
}
