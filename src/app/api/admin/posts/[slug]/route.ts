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
  const post = getPostBySlug(slug);
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
    if (!getPostBySlug(previousSlug)) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    const input = validatePostInput(await request.json());
    const post = writePost(input, previousSlug);
    revalidatePublic(post.slug, previousSlug);
    return NextResponse.json({ post });
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
    deletePost(slug);
    revalidatePublic(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
