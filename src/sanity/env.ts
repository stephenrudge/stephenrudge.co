/**
 * Public Sanity project settings.
 * projectId/dataset are safe to commit; tokens stay in env vars only.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/** Fallback matches the stephenrudge Sanity project when env is missing at build. */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "nay7jh43";

export function isSanityConfigured() {
  return Boolean(projectId && dataset && projectId !== "placeholder");
}

export const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "/studio";
