import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Subscriptions are not configured yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body &&
    "email" in body &&
    typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({
        ok: true,
        message: "You’re already on the list.",
      });
    }
    console.error("subscribe insert failed", error.message);
    return NextResponse.json(
      { error: "Could not subscribe right now. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "You’re subscribed. Thanks for following along.",
  });
}
