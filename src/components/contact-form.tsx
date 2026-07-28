"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const intents = [
  { value: "collaborate", label: "Collaborate" },
  { value: "host", label: "Host me" },
  { value: "other", label: "Something else" },
] as const;

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-50";

export function ContactForm({ className }: { className?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<(typeof intents)[number]["value"]>(
    "collaborate",
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, intent, message }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setStatus("error");
        setFeedback(data.error || "Something went wrong.");
        return;
      }
      setStatus("ok");
      setFeedback(data.message || "Thanks — I’ll get back to you soon.");
      setName("");
      setEmail("");
      setIntent("collaborate");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback("Could not reach the server. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-5", className)}>
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "loading"}
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className={fieldClass}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          I’m reaching out to…
        </legend>
        <div className="flex flex-wrap gap-2">
          {intents.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors",
                intent === option.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400",
              )}
            >
              <input
                type="radio"
                name="intent"
                value={option.value}
                checked={intent === option.value}
                onChange={() => setIntent(option.value)}
                className="sr-only"
                disabled={status === "loading"}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "loading"}
          placeholder="Tell me a bit about the collaboration, stay, or idea…"
          className={cn(fieldClass, "min-h-32 resize-y")}
        />
      </div>

      {feedback && (
        <p
          className={cn(
            "text-sm",
            status === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-600 dark:text-zinc-400",
          )}
          role="status"
        >
          {feedback}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
