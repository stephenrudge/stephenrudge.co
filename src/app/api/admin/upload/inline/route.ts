import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  githubContentConfigured,
  githubUpsertBinaryFile,
} from "@/lib/github-content";
import {
  buildInlineMarkdownSnippet,
  buildInlineUploadFileName,
  publicUploadPath,
  validateInlineImageBlob,
} from "@/lib/inline-image";
import {
  absoluteUploadPath,
  isUploadBlob,
} from "@/lib/upload";

export const runtime = "nodejs";

/**
 * Upload an inline body photo into `/public/uploads/`.
 * Locally writes to disk; on Vercel (or when GitHub is configured) also commits
 * the file via the GitHub Contents API so it survives the read-only filesystem.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const altRaw = formData.get("alt");
    const captionRaw = formData.get("caption");

    if (!isUploadBlob(file)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 },
      );
    }

    const mimeType = validateInlineImageBlob(file);
    const originalName =
      "name" in file && typeof file.name === "string" && file.name
        ? file.name
        : `upload.${mimeType.split("/")[1] || "jpg"}`;
    const fileName = buildInlineUploadFileName(originalName, mimeType);
    const bytes = Buffer.from(await file.arrayBuffer());
    const publicPath = publicUploadPath(fileName);
    const repoPath = `public/uploads/${fileName}`;

    const alt =
      typeof altRaw === "string" && altRaw.trim()
        ? altRaw.trim()
        : path.basename(originalName).replace(/\.[^.]+$/, "") || "Photo";
    const caption =
      typeof captionRaw === "string" && captionRaw.trim()
        ? captionRaw.trim()
        : undefined;

    let via: "local" | "github" | "local+github" = "local";

    if (githubContentConfigured()) {
      await githubUpsertBinaryFile(
        repoPath,
        bytes,
        `Add inline image: ${fileName}`,
      );
      via = "github";
    }

    // Always write locally when the filesystem is writable so the editor
    // preview works immediately without waiting for a redeploy.
    if (process.env.VERCEL !== "1") {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(absoluteUploadPath(fileName), bytes);
      via = githubContentConfigured() ? "local+github" : "local";
    } else if (!githubContentConfigured()) {
      return NextResponse.json(
        {
          error:
            "Inline uploads on Vercel need GITHUB_TOKEN and GITHUB_REPO so photos can be saved to /public/uploads via GitHub.",
        },
        { status: 400 },
      );
    }

    const markdown = buildInlineMarkdownSnippet(alt, publicPath, caption);

    return NextResponse.json({
      path: publicPath,
      markdown,
      via,
      fileName,
      message:
        via === "github"
          ? "Image committed to /public/uploads on GitHub. Redeploy for it to appear on the live site."
          : via === "local+github"
            ? "Image saved locally and committed to GitHub."
            : "Image saved to /public/uploads.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image.";
    console.error("[upload/inline]", message, error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
