import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllPosts } from "@/lib/posts";
import { validatePostInput, writePost } from "@/lib/post-writer";

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/destinations");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = getAllPosts({ includeDrafts: true }).map(
    ({ content: _content, ...post }) => post,
  );
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = validatePostInput(await request.json());
    const { post, via } = await writePost(input);
    revalidatePublic(post.slug);
    return NextResponse.json(
      {
        post,
        via,
        message:
          via === "github"
            ? "Saved to GitHub. Vercel will redeploy shortly."
            : "Saved locally.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
