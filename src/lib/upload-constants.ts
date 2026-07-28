export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_IMAGE_TYPES;

export function isAllowedImageType(type: string): type is AllowedMimeType {
  return type in ALLOWED_IMAGE_TYPES;
}
