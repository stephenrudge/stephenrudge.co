"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants";

const inputClass =
  "w-full border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-950";

type SignResponse = {
  error?: string;
  cloudinary?: boolean;
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  signature?: string;
  folder?: string;
  publicId?: string;
  eager?: string;
};

export function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function uploadViaCloudinary(file: File) {
    const signResponse = await fetch("/api/admin/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    });

    const signRaw = await signResponse.text();
    let sign: SignResponse | null = null;
    try {
      sign = signRaw ? (JSON.parse(signRaw) as SignResponse) : null;
    } catch {
      sign = null;
    }

    if (signResponse.status === 503 || sign?.cloudinary === false) {
      return uploadViaServer(file);
    }

    if (!signResponse.ok || !sign?.signature || !sign.cloudName || !sign.apiKey) {
      throw new Error(
        sign?.error ||
          (signResponse.status === 401
            ? "Session expired — sign in again at /admin/login."
            : "Could not prepare Cloudinary upload."),
      );
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sign.apiKey);
    body.append("timestamp", String(sign.timestamp));
    body.append("signature", sign.signature);
    body.append("folder", sign.folder || "stephenrudge/covers");
    body.append("public_id", sign.publicId || "");
    if (sign.eager) body.append("eager", sign.eager);
    body.append("overwrite", "false");

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
      { method: "POST", body },
    );

    const uploadData = (await uploadResponse.json().catch(() => null)) as {
      secure_url?: string;
      eager?: { secure_url?: string }[];
      error?: { message?: string };
    } | null;

    const url =
      uploadData?.eager?.[0]?.secure_url || uploadData?.secure_url;

    if (!uploadResponse.ok || !url) {
      throw new Error(
        uploadData?.error?.message ||
          `Cloudinary upload failed (${uploadResponse.status}).`,
      );
    }

    return url;
  }

  async function uploadViaServer(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      throw new Error(
        "Without Cloudinary, uploads are limited to 4MB. Add Cloudinary env vars for larger photos.",
      );
    }

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body,
    });

    const raw = await response.text();
    let data: { error?: string; path?: string } | null = null;
    try {
      data = raw ? (JSON.parse(raw) as { error?: string; path?: string }) : null;
    } catch {
      data = null;
    }

    if (!response.ok || !data?.path) {
      throw new Error(
        data?.error ||
          (response.status === 413
            ? "Image is too large for the server."
            : response.status === 401
              ? "Session expired — sign in again at /admin/login."
              : raw?.slice(0, 180) || `Upload failed (${response.status}).`),
      );
    }

    return data.path;
  }

  async function uploadFile(file: File) {
    setError("");
    setUploading(true);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error(
          `Image must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller.`,
        );
      }

      const path = await uploadViaCloudinary(file);
      onChange(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    void uploadFile(file);
  }

  function clearImage() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const displaySrc = previewUrl || value;
  const maxMb = MAX_UPLOAD_BYTES / (1024 * 1024);

  return (
    <div className="space-y-3 sm:col-span-2">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Cover image
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          onFileChange(event.dataTransfer.files);
        }}
        className={`rounded-lg border border-dashed px-4 py-6 transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        {displaySrc ? (
          <div className="space-y-3">
            <div className="relative mx-auto aspect-[16/10] max-w-xl overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displaySrc}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Change image"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                onClick={clearImage}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
            {value ? (
              <p className="break-all text-center text-xs text-zinc-500">
                {value}
              </p>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <ImagePlus className="h-8 w-8 text-accent" />
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {uploading
                ? "Uploading…"
                : "Drop an image here or click to upload"}
            </span>
            <span className="text-xs text-zinc-500">
              JPEG, PNG, WebP, AVIF, or HEIC · max {maxMb}MB · direct to
              Cloudinary
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
          className="hidden"
          onChange={(event) => onFileChange(event.target.files)}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Or paste an image URL
        </span>
        <input
          value={value}
          onChange={(event) => {
            setPreviewUrl(null);
            onChange(event.target.value.trim());
          }}
          placeholder="https://images.unsplash.com/…"
          className={inputClass}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
