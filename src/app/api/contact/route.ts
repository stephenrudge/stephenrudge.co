import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTENTS = new Set(["collaborate", "host", "other"]);

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Contact form is not configured yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const intent = typeof data.intent === "string" ? data.intent.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (!INTENTS.has(intent)) {
    return NextResponse.json(
      { error: "Choose how you’d like to connect." },
      { status: 400 },
    );
  }
  if (!message || message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: "Write a short message (at least a sentence)." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    intent,
    message,
  });

  if (error) {
    console.error("contact insert failed", error.message);
    return NextResponse.json(
      { error: "Could not send your message right now. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks — I’ll get back to you soon.",
  });
}
