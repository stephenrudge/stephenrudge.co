"use client";

import { useState } from "react";
import { Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubscribeFormProps = {
  className?: string;
  compact?: boolean;
};

export function SubscribeForm({ className, compact = false }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }
      setStatus("ok");
      setMessage(data.message || "You’re subscribed.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  return (
    <div className={cn(className)}>
      {compact ? (
        <div className="mb-3">
          <p className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
            Subscribe
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            New posts by email, or follow via RSS.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
            Follow along
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Get new journal posts by email, or follow the RSS feed in any reader.
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-stretch",
          compact && "sm:max-w-md",
        )}
      >
        <label className="sr-only" htmlFor="subscribe-email">
          Email address
        </label>
        <input
          id="subscribe-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === "loading"}
          className="h-10 w-full flex-1 rounded-md border border-zinc-300 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-50"
        />
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>

      {message && (
        <p
          className={cn(
            "mt-3 text-sm",
            status === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-600 dark:text-zinc-400",
          )}
          role="status"
        >
          {message}
        </p>
      )}

      <p className="mt-4">
        <a
          href="/rss.xml"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400"
        >
          <Rss className="h-4 w-4" aria-hidden />
          RSS feed
        </a>
      </p>
    </div>
  );
}
