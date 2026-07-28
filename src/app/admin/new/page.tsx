import { redirect } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata = {
  title: "New story",
  robots: { index: false, follow: false },
};

export default async function AdminNewPostPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return <PostEditor mode="create" />;
}
