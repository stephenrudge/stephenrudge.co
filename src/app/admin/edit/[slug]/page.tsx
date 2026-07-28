import { notFound, redirect } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPostBySlug } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Edit story",
  robots: { index: false, follow: false },
};

export default async function AdminEditPostPage({ params }: PageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const post = await getPostBySlug(slug, { includeDrafts: true });
  if (!post) notFound();

  return <PostEditor mode="edit" initialPost={post} />;
}
