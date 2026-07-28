import type { Post, PostFrontmatter } from "@/types";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { getPostBySlug } from "@/lib/posts";
import { slugify } from "@/lib/slug";
import readingTime from "reading-time";

export { slugify };

export type PostInput = PostFrontmatter & {
  slug: string;
  content: string;
};

export type WriteResult = {
  post: Post;
  via: "supabase";
};

export type DeleteResult = {
  via: "supabase";
};

function toRow(input: PostInput) {
  const draft = Boolean(input.draft);
  return {
    slug: slugify(input.slug || input.title),
    title: input.title,
    date: input.date,
    excerpt: input.excerpt,
    location: input.location,
    country: input.country,
    country_flag: "",
    region: input.region,
    trip_type: input.tripType,
    tags: input.tags,
    cover_image: input.coverImage,
    lat: input.lat,
    lng: input.lng,
    featured: draft ? false : Boolean(input.featured),
    draft,
    scheduled_for:
      !draft && input.scheduledFor ? input.scheduledFor : null,
    content: input.content || "",
    gallery: input.gallery || [],
    updated_at: new Date().toISOString(),
  };
}

function toPost(input: PostInput, id?: string): Post {
  return {
    id,
    ...input,
    slug: slugify(input.slug || input.title),
    readingTime: readingTime(input.content || "story").text,
  };
}

export async function writePost(
  input: PostInput,
  previousSlug?: string,
): Promise<WriteResult> {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("A valid slug is required.");

  const client = createSupabaseAdminClient();
  const row = toRow({ ...input, slug });

  const existing = await getPostBySlug(slug, { includeDrafts: true });
  if (existing && existing.slug !== previousSlug) {
    throw new Error(`A post with slug "${slug}" already exists.`);
  }

  if (previousSlug && previousSlug !== slug) {
    const { error: deleteError } = await client
      .from("posts")
      .delete()
      .eq("slug", previousSlug);
    if (deleteError) throw new Error(deleteError.message);
  }

  const { data, error } = await client
    .from("posts")
    .upsert(row, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return {
    post: toPost({ ...input, slug }, data?.id),
    via: "supabase",
  };
}

export async function deletePost(slug: string): Promise<DeleteResult> {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("posts").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  return { via: "supabase" };
}

export function validatePostInput(body: unknown): PostInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body.");
  }

  const data = body as Record<string, unknown>;
  const draft = Boolean(data.draft);
  const title = String(data.title || "").trim();
  const content = String(data.content || "").trim();
  const excerpt = String(data.excerpt || "").trim();
  const location = String(data.location || "").trim();
  const country = String(data.country || "").trim();
  const coverImage = String(data.coverImage || "").trim();
  const date = String(data.date || "").trim();
  const region = String(data.region || "").trim();
  const slug = slugify(String(data.slug || title));

  let scheduledFor: string | undefined;
  const rawSchedule = String(data.scheduledFor || "").trim();
  if (!draft && rawSchedule) {
    const when = new Date(rawSchedule);
    if (Number.isNaN(when.getTime())) {
      throw new Error("Scheduled time is invalid.");
    }
    if (when.getTime() <= Date.now() + 60_000) {
      throw new Error("Schedule time must be at least one minute in the future.");
    }
    scheduledFor = when.toISOString();
  }

  if (!title) throw new Error("Title is required.");

  if (!draft) {
    if (!content) throw new Error("Story content is required.");
    if (!location) throw new Error("Location is required.");
    if (!country) throw new Error("Country is required.");
    if (!coverImage) throw new Error("Cover image is required.");
    if (!date) throw new Error("Date is required.");
    if (!region) throw new Error("Region is required.");
  }

  const latRaw = String(data.lat ?? "").trim();
  const lngRaw = String(data.lng ?? "").trim();
  const lat = latRaw === "" ? NaN : Number(latRaw);
  const lng = lngRaw === "" ? NaN : Number(lngRaw);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if ((latRaw !== "" || lngRaw !== "") && !hasCoords) {
    throw new Error("Latitude and longitude must be valid numbers.");
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
    date: date || new Date().toISOString().slice(0, 10),
    excerpt,
    location: location || (draft ? "TBD" : location),
    country: country || (draft ? "TBD" : country),
    countryFlag: "",
    region: (region || "Europe") as PostFrontmatter["region"],
    tripType: (tripType.length
      ? tripType
      : ["Solo Travel"]) as PostFrontmatter["tripType"],
    tags,
    coverImage:
      coverImage ||
      (draft
        ? "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"
        : coverImage),
    lat: hasCoords ? lat : 0,
    lng: hasCoords ? lng : 0,
    featured: draft ? false : Boolean(data.featured),
    draft,
    ...(scheduledFor ? { scheduledFor } : {}),
    content: content || (draft ? "" : content),
  };
}
