import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Destination, MapPin, Post, PostFrontmatter } from "@/types";

export { filterPosts, REGIONS, TRIP_TYPES } from "@/lib/filters";

const postsDirectory = path.join(process.cwd(), "content/posts");

function parsePost(filename: string): Post {
  const slug = filename.replace(/\.mdx?$/, "");
  const fullPath = path.join(postsDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as PostFrontmatter;

  return {
    slug,
    content,
    readingTime: readingTime(content).text,
    ...frontmatter,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => /\.mdx?$/.test(file))
    .map(parsePost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}

export function getFeaturedPosts(): Post[] {
  const posts = getAllPosts();
  const featured = posts.filter((post) => post.featured);
  return featured.length > 0 ? featured : posts.slice(0, 3);
}

export function getMapPins(): MapPin[] {
  return getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    location: post.location,
    countryFlag: post.countryFlag,
    lat: post.lat,
    lng: post.lng,
  }));
}

export function getDestinations(): Destination[] {
  const posts = getAllPosts();
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
