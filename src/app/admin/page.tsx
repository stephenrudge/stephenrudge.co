import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryActions } from "@/components/admin/story-actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllPosts, isDraftPost } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function StoryList({
  posts,
  emptyLabel,
}: {
  posts: Post[];
  emptyLabel: string;
}) {
  if (posts.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-zinc-500">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
        >
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {post.countryFlag} {post.title}
              {isDraftPost(post) ? (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Draft
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {formatDate(post.date)} · {post.location}, {post.country}
              {post.featured ? " · Featured" : ""}
            </p>
          </div>
          <StoryActions
            slug={post.slug}
            title={post.title}
            isDraft={isDraftPost(post)}
          />
        </li>
      ))}
    </ul>
  );
}

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const posts = getAllPosts({ includeDrafts: true });
  const published = posts.filter((post) => !isDraftPost(post));
  const drafts = posts.filter(isDraftPost);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
            Stories
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {published.length} published · {drafts.length}{" "}
            {drafts.length === 1 ? "draft" : "drafts"}. On Vercel, changes
            commit to GitHub and redeploy in about a minute.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/new">
            <Plus className="h-4 w-4" />
            New story
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-xl text-zinc-900 dark:text-zinc-50">
          Published
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <StoryList
            posts={published}
            emptyLabel="No published stories yet."
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl text-zinc-900 dark:text-zinc-50">
              Drafts
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Work-in-progress stories — hidden from the public site until you
              publish.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-dashed border-amber-300/80 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
          <StoryList
            posts={drafts}
            emptyLabel="No drafts yet. Save a story as a draft to write ahead."
          />
        </div>
      </section>
    </div>
  );
}
