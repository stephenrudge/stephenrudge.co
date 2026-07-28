import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Post, PostFrontmatter } from "@/types";
import { getPostBySlug } from "@/lib/posts";
import { slugify } from "@/lib/slug";

export { slugify };

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostInput = PostFrontmatter & {
  slug: string;
  content: string;
};

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

function serializePost(input: PostInput) {
  const { slug: _slug, content, ...frontmatter } = input;
  return matter.stringify(content.trim() + "\n", {
    ...frontmatter,
    tripType: frontmatter.tripType,
    tags: frontmatter.tags,
    featured: Boolean(frontmatter.featured),
  });
}

export function writePost(input: PostInput, previousSlug?: string): Post {
  ensurePostsDir();

  const slug = slugify(input.slug || input.title);
  if (!slug) {
    throw new Error("A valid slug is required.");
  }

  if (previousSlug && previousSlug !== slug) {
    const oldPath = path.join(postsDirectory, `${previousSlug}.mdx`);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const existing = getPostBySlug(slug);
  if (existing && existing.slug !== previousSlug) {
    throw new Error(`A post with slug "${slug}" already exists.`);
  }

  const filePath = path.join(postsDirectory, `${slug}.mdx`);
  fs.writeFileSync(filePath, serializePost({ ...input, slug }), "utf8");

  const saved = getPostBySlug(slug);
  if (!saved) throw new Error("Failed to save post.");
  return saved;
}

export function deletePost(slug: string) {
  const filePath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error("Post not found.");
  }
  fs.unlinkSync(filePath);
}

export function validatePostInput(body: unknown): PostInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body.");
  }

  const data = body as Record<string, unknown>;
  const title = String(data.title || "").trim();
  const content = String(data.content || "").trim();
  const excerpt = String(data.excerpt || "").trim();
  const location = String(data.location || "").trim();
  const country = String(data.country || "").trim();
  const countryFlag = String(data.countryFlag || "").trim();
  const coverImage = String(data.coverImage || "").trim();
  const date = String(data.date || "").trim();
  const region = String(data.region || "").trim();
  const slug = slugify(String(data.slug || title));

  if (!title) throw new Error("Title is required.");
  if (!content) throw new Error("Story content is required.");
  if (!excerpt) throw new Error("Excerpt is required.");
  if (!location) throw new Error("Location is required.");
  if (!country) throw new Error("Country is required.");
  if (!coverImage) throw new Error("Cover image URL is required.");
  if (!date) throw new Error("Date is required.");
  if (!region) throw new Error("Region is required.");

  const lat = Number(data.lat);
  const lng = Number(data.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Valid latitude and longitude are required.");
  }

  const tripType = Array.isArray(data.tripType)
    ? data.tripType.map(String)
    : String(data.tripType || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const tags = Array.isArray(data.tags)
    ? data.tags.map(String)
    : String(data.tags || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    slug,
    title,
    date,
    excerpt,
    location,
    country,
    countryFlag: countryFlag || "🌍",
    region: region as PostFrontmatter["region"],
    tripType: tripType as PostFrontmatter["tripType"],
    tags,
    coverImage,
    lat,
    lng,
    featured: Boolean(data.featured),
    content,
  };
}
