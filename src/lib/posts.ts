import readingTime from "reading-time";
import type { Destination, GalleryImage, MapPin, Post, Region, TripType } from "@/types";
import {
  createSupabaseAdminClient,
  createSupabaseAnonClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

export { filterPosts, REGIONS, TRIP_TYPES } from "@/lib/filters";

type DbPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  location: string;
  country: string;
  country_flag: string;
  region: string;
  trip_type: string[] | null;
  tags: string[] | null;
  cover_image: string;
  lat: number;
  lng: number;
  featured: boolean;
  draft: boolean;
  scheduled_for: string | null;
  content: string;
  gallery: GalleryImage[] | null;
};

function mapRow(row: DbPost): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    location: row.location,
    country: row.country,
    countryFlag: row.country_flag || "",
    region: (row.region || "Europe") as Region,
    tripType: (row.trip_type?.length
      ? row.trip_type
      : ["Solo Travel"]) as TripType[],
    tags: row.tags || [],
    coverImage: row.cover_image || "",
    lat: Number(row.lat) || 0,
    lng: Number(row.lng) || 0,
    featured: Boolean(row.featured),
    draft: Boolean(row.draft),
    scheduledFor: row.scheduled_for || undefined,
    gallery: row.gallery || [],
    content: row.content || "",
    readingTime: readingTime(row.content || "story").text,
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

export function isLivePost(
  post: Pick<Post, "draft" | "scheduledFor">,
  now = Date.now(),
) {
  if (isDraftPost(post)) return false;
  if (!post.scheduledFor) return true;
  const at = new Date(post.scheduledFor).getTime();
  return Number.isFinite(at) && at <= now;
}

async function fetchPosts(includeDrafts: boolean): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const client = includeDrafts
      ? createSupabaseAdminClient()
      : createSupabaseAnonClient();

    const { data, error } = await client
      .from("posts")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("[posts]", error.message);
      return [];
    }

    const posts = ((data as DbPost[]) || []).map(mapRow);
    if (includeDrafts) return posts;
    return posts.filter((post) => isLivePost(post));
  } catch (error) {
    console.error("[posts]", error);
    return [];
  }
}

export async function getAllPosts(options?: {
  includeDrafts?: boolean;
}): Promise<Post[]> {
  return fetchPosts(Boolean(options?.includeDrafts));
}

export async function getDraftPosts(): Promise<Post[]> {
  return (await fetchPosts(true)).filter(isDraftPost);
}

export async function getScheduledPosts(): Promise<Post[]> {
  return (await fetchPosts(true))
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
  if (!isSupabaseConfigured()) return undefined;

  try {
    const includeDrafts = Boolean(options?.includeDrafts);
    const client = includeDrafts
      ? createSupabaseAdminClient()
      : createSupabaseAnonClient();

    const { data, error } = await client
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return undefined;
    const post = mapRow(data as DbPost);
    if (!isLivePost(post) && !includeDrafts) return undefined;
    return post;
  } catch (error) {
    console.error("[posts]", slug, error);
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
  return posts
    .filter((post) => hasMapCoords(post.lat, post.lng))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      location: post.location,
      countryFlag: "",
      lat: post.lat,
      lng: post.lng,
    }));
}

export function hasMapCoords(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
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
        countryFlag: post.countryFlag || "",
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
