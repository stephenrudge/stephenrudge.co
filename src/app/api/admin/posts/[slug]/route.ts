import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPostBySlug } from "@/lib/posts";
import { deletePost, validatePostInput, writePost } from "@/lib/post-writer";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function revalidatePublic(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/destinations");
  revalidatePath("/rss.xml");
  revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const post = await getPostBySlug(slug, { includeDrafts: true });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug: previousSlug } = await context.params;

  try {
    if (!(await getPostBySlug(previousSlug, { includeDrafts: true }))) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    const input = validatePostInput(await request.json());
    const { post, via } = await writePost(input, previousSlug);
    revalidatePublic(post.slug, previousSlug);
    return NextResponse.json({
      post,
      via,
      message: "Updated in Supabase — live on the site now.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  try {
    const { via } = await deletePost(slug);
    revalidatePublic(slug);
    return NextResponse.json({
      ok: true,
      via,
      message: "Deleted from Supabase.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
