"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoryActions({
  slug,
  title,
  canViewPublic = false,
}: {
  slug: string;
  title: string;
  canViewPublic?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError("");

    const response = await fetch(`/api/admin/posts/${slug}`, {
      method: "DELETE",
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
      via?: "supabase" | "local" | "github";
    } | null;

    setDeleting(false);

    if (!response.ok) {
      setError(data?.error || "Could not delete story.");
      return;
    }

    if (data?.message) {
      window.alert(data.message);
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {canViewPublic ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/${slug}`}>View</Link>
          </Button>
        ) : null}
        <Button asChild size="sm">
          <Link href={`/admin/edit/${slug}`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          disabled={deleting}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
