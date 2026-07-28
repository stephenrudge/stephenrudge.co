import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookBody = {
  _type?: string;
  slug?: string | { current?: string };
};

/**
 * Sanity webhook → instant cache bust (no full Vercel rebuild).
 * Configure in Sanity: https://www.sanity.io/manage → API → Webhooks
 * URL: https://your-domain/api/revalidate?secret=YOUR_SECRET
 * Or set header / body secret matching SANITY_REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "Missing SANITY_REVALIDATE_SECRET" },
        { status: 500 },
      );
    }

    const { isValidSignature, body } = await parseBody<WebhookBody>(
      request,
      secret,
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    const slug =
      typeof body?.slug === "string"
        ? body.slug
        : body?.slug?.current || undefined;

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/destinations");

    if (slug) {
      revalidatePath(`/blog/${slug}`);
    } else {
      // Unknown slug — refresh the dynamic blog segment broadly.
      revalidatePath("/blog", "layout");
    }

    return NextResponse.json({
      revalidated: true,
      slug: slug || null,
      now: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error revalidating";
    console.error("[revalidate]", message, error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
