/** Client-side max for direct Cloudinary uploads (Free plan image limit is 10MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
} as const;

/** Inline body photos — JPEG, PNG, WebP, AVIF only. */
export const INLINE_ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_IMAGE_TYPES;
export type InlineAllowedMimeType = keyof typeof INLINE_ALLOWED_IMAGE_TYPES;

export function isAllowedImageType(type: string): type is AllowedMimeType {
  return type in ALLOWED_IMAGE_TYPES;
}

export function isInlineAllowedImageType(
  type: string,
): type is InlineAllowedMimeType {
  return type in INLINE_ALLOWED_IMAGE_TYPES;
}
