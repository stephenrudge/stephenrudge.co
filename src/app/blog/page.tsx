import type { Metadata } from "next";
import { PostFeed } from "@/components/post-feed";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Journal",
  description: "All travel stories, field notes, and photography essays.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Journal
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Travel logs from the road — filter by region or trip type.
        </p>
      </div>
      <PostFeed posts={posts} />
    </div>
  );
}
