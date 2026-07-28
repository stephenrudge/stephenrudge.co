import type { PortableTextBlock } from "@portabletext/types";
import readingTime from "reading-time";
import type { Destination, MapPin, Post, Region, TripType } from "@/types";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import {
  POST_BY_SLUG_QUERY,
  POSTS_QUERY,
} from "@/sanity/lib/queries";

export { filterPosts, REGIONS, TRIP_TYPES } from "@/lib/filters";

type SanityPost = {
  _id?: string;
  title?: string;
  slug?: string;
  date?: string;
  excerpt?: string;
  location?: string;
  country?: string;
  countryFlag?: string;
  region?: Region;
  tripType?: TripType[];
  tags?: string[];
  coverImage?: string | null;
  coverImageAlt?: string | null;
  lat?: number;
  lng?: number;
  featured?: boolean;
  scheduledFor?: string | null;
  gallery?: { src?: string | null; alt?: string | null }[] | null;
  body?: PortableTextBlock[] | null;
};

function portableTextToPlain(blocks: PortableTextBlock[] | null | undefined) {
  if (!blocks?.length) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !("children" in block)) return "";
      const children = block.children as { text?: string }[] | undefined;
      return (children || []).map((child) => child.text || "").join("");
    })
    .join("\n");
}

function mapSanityPost(doc: SanityPost): Post {
  const body = doc.body || [];
  const plain = portableTextToPlain(body);

  return {
    slug: doc.slug || "",
    title: doc.title || "Untitled",
    date: doc.date || new Date().toISOString().slice(0, 10),
    excerpt: doc.excerpt || "",
    location: doc.location || "",
    country: doc.country || "",
    countryFlag: doc.countryFlag || "🌍",
    region: (doc.region || "Europe") as Region,
    tripType: (doc.tripType?.length ? doc.tripType : ["Solo Travel"]) as TripType[],
    tags: doc.tags || [],
    coverImage: doc.coverImage || "",
    lat: Number.isFinite(doc.lat) ? Number(doc.lat) : 0,
    lng: Number.isFinite(doc.lng) ? Number(doc.lng) : 0,
    featured: Boolean(doc.featured),
    // Sanity drafts are unpublished; published docs are never "draft" here.
    draft: false,
    scheduledFor: doc.scheduledFor || undefined,
    gallery: (doc.gallery || [])
      .filter((image): image is { src: string; alt?: string | null } =>
        Boolean(image?.src),
      )
      .map((image) => ({
        src: image.src,
        alt: image.alt || "",
      })),
    content: body,
    readingTime: readingTime(plain || "story").text,
  };
}

export function isDraftPost(post: Pick<Post, "draft">) {
  return Boolean(post.draft);
}

export function isScheduledPost(
  post: Pick<Post, "draft" | "scheduledFor">,
  now = Date.now(),
) {
  if (isDraftPost(post) || !post.scheduledFor) return false;
  const at = new Date(post.scheduledFor).getTime();
  return Number.isFinite(at) && at > now;
}

/** Visible on the public site right now. */
export function isLivePost(
  post: Pick<Post, "draft" | "scheduledFor">,
  now = Date.now(),
) {
  if (isDraftPost(post)) return false;
  if (!post.scheduledFor) return true;
  const at = new Date(post.scheduledFor).getTime();
  return Number.isFinite(at) && at <= now;
}

async function fetchAllSanityPosts(): Promise<Post[]> {
  if (!isSanityConfigured()) return [];

  try {
    const { data } = await sanityFetch({
      query: POSTS_QUERY,
    });
    return ((data as SanityPost[]) || []).map(mapSanityPost);
  } catch (error) {
    console.error("[posts] Failed to fetch from Sanity", error);
    return [];
  }
}

/** Live posts only (public site). Pass `{ includeDrafts: true }` to include scheduled. */
export async function getAllPosts(options?: {
  includeDrafts?: boolean;
}): Promise<Post[]> {
  const posts = await fetchAllSanityPosts();
  if (options?.includeDrafts) return posts;
  return posts.filter((post) => isLivePost(post));
}

export async function getDraftPosts(): Promise<Post[]> {
  // Unpublished drafts are only visible via Sanity Studio / draft mode.
  return [];
}

export async function getScheduledPosts(): Promise<Post[]> {
  const posts = await fetchAllSanityPosts();
  return posts
    .filter(isScheduledPost)
    .sort((a, b) => {
      const aTime = new Date(a.scheduledFor || 0).getTime();
      const bTime = new Date(b.scheduledFor || 0).getTime();
      return aTime - bTime;
    });
}

export async function getPublishedPosts(): Promise<Post[]> {
  return getAllPosts();
}

export async function getPostBySlug(
  slug: string,
  options?: { includeDrafts?: boolean },
): Promise<Post | undefined> {
  if (!isSanityConfigured()) return undefined;

  try {
    const { data } = await sanityFetch({
      query: POST_BY_SLUG_QUERY,
      params: { slug },
    });
    if (!data) return undefined;
    const post = mapSanityPost(data as SanityPost);
    if (!isLivePost(post) && !options?.includeDrafts) return undefined;
    return post;
  } catch (error) {
    console.error("[posts] Failed to fetch post", slug, error);
    return undefined;
  }
}

export async function getAdjacentPosts(slug: string) {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const featured = posts.filter((post) => post.featured);
  return featured.length > 0 ? featured : posts.slice(0, 3);
}

export async function getMapPins(): Promise<MapPin[]> {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    location: post.location,
    countryFlag: post.countryFlag,
    lat: post.lat,
    lng: post.lng,
  }));
}

export async function getDestinations(): Promise<Destination[]> {
  const posts = await getPublishedPosts();
  const byCountry = new Map<string, Destination>();

  for (const post of posts) {
    const existing = byCountry.get(post.country);
    if (existing) {
      existing.postCount += 1;
      if (!existing.cities.includes(post.location)) {
        existing.cities.push(post.location);
      }
      existing.posts.push({
        slug: post.slug,
        title: post.title,
        location: post.location,
      });
    } else {
      byCountry.set(post.country, {
        country: post.country,
        countryFlag: post.countryFlag,
        region: post.region,
        cities: [post.location],
        postCount: 1,
        posts: [
          {
            slug: post.slug,
            title: post.title,
            location: post.location,
          },
        ],
      });
    }
  }

  return Array.from(byCountry.values()).sort((a, b) =>
    a.country.localeCompare(b.country),
  );
}
