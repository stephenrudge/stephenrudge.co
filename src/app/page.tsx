import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { MapSection } from "@/components/map/map-section";
import { PostCard } from "@/components/post-card";
import { PostFeed } from "@/components/post-feed";
import { getAllPosts, getFeaturedPosts, getMapPins } from "@/lib/posts";

/** Revalidate periodically; publishes also call revalidatePath. */
export const revalidate = 60;

export default async function HomePage() {
  const [featured, allPosts, pins] = await Promise.all([
    getFeaturedPosts(),
    getAllPosts(),
    getMapPins(),
  ]);

  return (
    <>
      <Hero />

      {pins.length > 0 ? <MapSection pins={pins} /> : null}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Featured stories
            </h2>
            <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
              Recent field notes with cover photos, reading time, and location
              tags.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm text-accent hover:underline sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10">
          <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Browse the journal
          </h2>
          <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
            Filter by region or trip type to find the right kind of story.
          </p>
        </div>
        <PostFeed posts={allPosts} />
      </section>
    </>
  );
}
