import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

async function gone() {
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

export async function GET() {
  return gone();
}

export async function PUT() {
  return gone();
}

export async function DELETE() {
  return gone();
}
