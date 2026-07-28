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

export function validateImageFile(file: File) {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("No image file provided.");
  }
  if (!isAllowedImageType(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and AVIF images are allowed.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }
  return file.type;
}
