import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  githubUpsertBinaryFile,
  shouldUseGitHubContent,
} from "@/lib/github-content";
import {
  absoluteUploadPath,
  buildUploadFileName,
  publicUploadPath,
  validateImageFile,
} from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 },
      );
    }

    const mimeType = validateImageFile(file);
    const fileName = buildUploadFileName(file.name, mimeType);
    const bytes = Buffer.from(await file.arrayBuffer());
    const publicPath = publicUploadPath(fileName);

    if (shouldUseGitHubContent()) {
      await githubUpsertBinaryFile(
        `public/uploads/${fileName}`,
        bytes,
        `Upload cover image: ${fileName}`,
      );

      return NextResponse.json({
        path: publicPath,
        via: "github",
        message:
          "Image uploaded to GitHub. It will appear after the next deploy (usually under a minute).",
      });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(absoluteUploadPath(fileName), bytes);

    return NextResponse.json({
      path: publicPath,
      via: "local",
      message: "Image uploaded.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
