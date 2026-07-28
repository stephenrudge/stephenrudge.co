import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryActions } from "@/components/admin/story-actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const posts = getAllPosts();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
            Stories
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {posts.length} published {posts.length === 1 ? "story" : "stories"}.
            On Vercel, changes commit to GitHub and redeploy in about a minute.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/new">
            <Plus className="h-4 w-4" />
            New story
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {posts.length === 0 ? (
          <p className="px-5 py-10 text-center text-zinc-500">
            No stories yet.{" "}
            <Link href="/admin/new" className="text-accent hover:underline">
              Write your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {post.countryFlag} {post.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(post.date)} · {post.location}, {post.country}
                    {post.featured ? " · Featured" : ""}
                  </p>
                </div>
                <StoryActions slug={post.slug} title={post.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
