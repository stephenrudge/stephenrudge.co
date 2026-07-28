import path from "path";
import {
  buildUploadFileName,
  publicUploadPath,
} from "@/lib/upload";
import {
  INLINE_ALLOWED_IMAGE_TYPES,
  isInlineAllowedImageType,
  MAX_UPLOAD_BYTES,
  type AllowedMimeType,
  type InlineAllowedMimeType,
} from "@/lib/upload-constants";

const EXT_TO_MIME: Record<string, InlineAllowedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export function resolveInlineMimeType(
  file: Blob & { name?: string },
): InlineAllowedMimeType {
  if (isInlineAllowedImageType(file.type)) {
    return file.type;
  }

  const ext = path.extname(file.name || "").replace(".", "").toLowerCase();
  const fromExt = EXT_TO_MIME[ext];
  if (fromExt) return fromExt;

  throw new Error("Only JPEG, PNG, WebP, or AVIF images are allowed.");
}

export function validateInlineImageBlob(file: Blob & { name?: string }) {
  if (!file || file.size === 0) {
    throw new Error("No image file provided.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller.`,
    );
  }
  return resolveInlineMimeType(file);
}

export function buildInlineUploadFileName(
  originalName: string,
  mimeType: InlineAllowedMimeType,
) {
  return buildUploadFileName(originalName, mimeType as AllowedMimeType);
}

/** Markdown snippet ready to paste into a post body. */
export function buildInlineMarkdownSnippet(
  alt: string,
  publicPath: string,
  caption?: string,
) {
  const safeAlt = (alt || "Photo").replace(/[[\]]/g, "").trim() || "Photo";
  const safeCaption = caption?.replace(/"/g, "'").trim();

  if (safeCaption) {
    return `![${safeAlt}](${publicPath} "${safeCaption}")`;
  }

  return `![${safeAlt}](${publicPath})`;
}

export {
  INLINE_ALLOWED_IMAGE_TYPES,
  isInlineAllowedImageType,
  MAX_UPLOAD_BYTES,
  publicUploadPath,
};
