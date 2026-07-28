import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "MDX admin APIs are retired. Create and publish stories in Sanity Studio at /studio.",
    },
    { status: 410 },
  );
}

export async function POST() {
  return GET();
}
