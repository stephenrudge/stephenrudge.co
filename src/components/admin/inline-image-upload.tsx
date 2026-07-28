"use client";

import { useRef, useState } from "react";
import { Check, Copy, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif";

type UploadResponse = {
  error?: string;
  path?: string;
  markdown?: string;
  message?: string;
};

export function InlineImageUpload({
  onInsert,
}: {
  onInsert: (markdown: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [snippet, setSnippet] = useState("");
  const [copied, setCopied] = useState(false);

  async function uploadFile(file: File) {
    setError("");
    setSnippet("");
    setCopied(false);

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`Image must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller.`);
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (alt.trim()) body.append("alt", alt.trim());
      if (caption.trim()) body.append("caption", caption.trim());

      const response = await fetch("/api/admin/upload/inline", {
        method: "POST",
        body,
      });

      const data = (await response.json().catch(() => null)) as UploadResponse | null;
      if (!response.ok || !data?.markdown) {
        throw new Error(data?.error || "Upload failed.");
      }

      setSnippet(data.markdown);
      onInsert(data.markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function copySnippet() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[10rem] flex-1">
          <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Alt text
          </span>
          <input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="View from the trail"
            className="w-full border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="min-w-[10rem] flex-1">
          <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Caption (optional)
          </span>
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Late light on the falls"
            className="w-full border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Insert photo
            </>
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />
      </div>

      <p className="text-xs text-zinc-500">
        JPEG, PNG, WebP, or AVIF up to 10MB. Uploads go to{" "}
        <code className="text-[11px]">/public/uploads/</code> and the Markdown
        snippet is inserted at your cursor.
      </p>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {snippet ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-950">
          <code className="min-w-0 flex-1 break-all text-xs text-zinc-700 dark:text-zinc-300">
            {snippet}
          </code>
          <Button type="button" variant="outline" size="sm" onClick={() => void copySnippet()}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
