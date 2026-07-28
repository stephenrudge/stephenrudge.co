import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryActions } from "@/components/admin/story-actions";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAllPosts,
  isDraftPost,
  isLivePost,
  isScheduledPost,
} from "@/lib/posts";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Post } from "@/types";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function StoryList({
  posts,
  emptyLabel,
  badge,
}: {
  posts: Post[];
  emptyLabel: string;
  badge?: "draft" | "scheduled";
}) {
  if (posts.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-zinc-500">{emptyLabel}</p>
    );
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
              {badge === "draft" ? (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Draft
                </span>
              ) : null}
              {badge === "scheduled" ? (
                <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                  Scheduled
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {formatDate(post.date)} · {post.location}, {post.country}
              {post.featured ? " · Featured" : ""}
              {badge === "scheduled" && post.scheduledFor
                ? ` · Goes live ${formatDateTime(post.scheduledFor)}`
                : ""}
            </p>
          </div>
          <StoryActions
            slug={post.slug}
            title={post.title}
            canViewPublic={isLivePost(post)}
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

  const posts = await getAllPosts({ includeDrafts: true });
  const published = posts.filter(isLivePost);
  const scheduled = posts
    .filter(isScheduledPost)
    .sort((a, b) => {
      const aTime = new Date(a.scheduledFor || 0).getTime();
      const bTime = new Date(b.scheduledFor || 0).getTime();
      return aTime - bTime;
    });
  const drafts = posts.filter(isDraftPost);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
            Stories
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {published.length} live · {scheduled.length} scheduled ·{" "}
            {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}.
            Publish goes live immediately via Supabase.
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
          <StoryList posts={published} emptyLabel="No published stories yet." />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="font-serif text-xl text-zinc-900 dark:text-zinc-50">
            Scheduled
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ready to go live automatically at the scheduled time.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-dashed border-sky-300/80 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/20">
          <StoryList
            posts={scheduled}
            badge="scheduled"
            emptyLabel="No scheduled stories. Set a future time and click Schedule."
          />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="font-serif text-xl text-zinc-900 dark:text-zinc-50">
            Drafts
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Work-in-progress stories — hidden until you schedule or publish.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-dashed border-amber-300/80 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
          <StoryList
            posts={drafts}
            badge="draft"
            emptyLabel="No drafts yet. Save a story as a draft to write ahead."
          />
        </div>
      </section>
    </div>
  );
}
