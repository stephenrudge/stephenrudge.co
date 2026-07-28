/**
 * Legacy MDX writer — retired in favor of Sanity Studio (`/studio`).
 * Kept temporarily so old imports resolve; all methods throw.
 */
import type { Post, PostFrontmatter } from "@/types";
import { slugify } from "@/lib/slug";

export { slugify };

export type PostInput = PostFrontmatter & {
  slug: string;
  content: string;
};

export type WriteResult = {
  post: Post;
  via: "local" | "github";
};

export type DeleteResult = {
  via: "local" | "github";
};

const RETIRED =
  "MDX file writing is retired. Publish stories from Sanity Studio at /studio.";

export async function writePost(
  _input: PostInput,
  _previousSlug?: string,
): Promise<WriteResult> {
  throw new Error(RETIRED);
}

export async function deletePost(_slug: string): Promise<DeleteResult> {
  throw new Error(RETIRED);
}

export function validatePostInput(_body: unknown): PostInput {
  throw new Error(RETIRED);
}
