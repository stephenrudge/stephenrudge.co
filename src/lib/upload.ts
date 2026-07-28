import { randomBytes } from "crypto";
import path from "path";
import {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
  type AllowedMimeType,
} from "@/lib/upload-constants";

export {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
  type AllowedMimeType,
} from "@/lib/upload-constants";

const EXT_TO_MIME: Record<string, AllowedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

/** FormData files on the server are not always `instanceof File`. */
export function isUploadBlob(
  value: FormDataEntryValue | null,
): value is File {
  if (typeof value !== "object" || value === null) return false;
  if (typeof value === "string") return false;
  const blob = value as Blob;
  return (
    typeof blob.arrayBuffer === "function" &&
    typeof blob.size === "number" &&
    typeof blob.type === "string"
  );
}

/** Strip path parts and unsafe characters; keep a short readable base name. */
export function sanitizeBaseName(filename: string): string {
  const base = path.basename(filename).replace(/\.[^.]+$/, "");
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return cleaned || "image";
}

export function buildUploadFileName(
  originalName: string,
  mimeType: AllowedMimeType,
) {
  const ext = ALLOWED_IMAGE_TYPES[mimeType];
  const stamp = Date.now().toString(36);
  const nonce = randomBytes(3).toString("hex");
  return `${sanitizeBaseName(originalName)}-${stamp}-${nonce}.${ext}`;
}

export function publicUploadPath(fileName: string) {
  return `/uploads/${fileName}`;
}

export function absoluteUploadPath(fileName: string) {
  return path.join(process.cwd(), "public", "uploads", fileName);
}

export function resolveMimeType(
  file: Blob & { name?: string },
): AllowedMimeType {
  if (isAllowedImageType(file.type)) {
    return file.type;
  }

  const ext = path.extname(file.name || "").replace(".", "").toLowerCase();
  const fromExt = EXT_TO_MIME[ext];
  if (fromExt) return fromExt;

  throw new Error(
    "Only JPEG, PNG, WebP, AVIF, or HEIC images are allowed.",
  );
}

export function validateImageBlob(file: Blob & { name?: string }) {
  if (!file || file.size === 0) {
    throw new Error("No image file provided.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller.`,
    );
  }
  return resolveMimeType(file);
}
