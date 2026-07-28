import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  cloudinaryConfigured,
  uploadCoverImageToCloudinary,
} from "@/lib/cloudinary";
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

/** Upload an inline body photo (Cloudinary preferred; local fallback in dev). */
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

    const alt =
      typeof altRaw === "string" && altRaw.trim()
        ? altRaw.trim()
        : path.basename(originalName).replace(/\.[^.]+$/, "") || "Photo";
    const caption =
      typeof captionRaw === "string" && captionRaw.trim()
        ? captionRaw.trim()
        : undefined;

    let publicPath = publicUploadPath(fileName);
    let via: "cloudinary" | "local" = "local";

    if (cloudinaryConfigured()) {
      const uploaded = await uploadCoverImageToCloudinary({
        bytes,
        mimeType,
        fileName,
      });
      publicPath = uploaded.url;
      via = "cloudinary";
    } else if (process.env.VERCEL === "1" || process.env.CF_PAGES === "1") {
      return NextResponse.json(
        {
          error:
            "Cloudinary is required in production for inline photos.",
        },
        { status: 400 },
      );
    } else {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(absoluteUploadPath(fileName), bytes);
    }

    const markdown = buildInlineMarkdownSnippet(alt, publicPath, caption);

    return NextResponse.json({
      path: publicPath,
      markdown,
      via,
      fileName,
      message:
        via === "cloudinary"
          ? "Photo uploaded to Cloudinary."
          : "Photo saved to /public/uploads.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image.";
    console.error("[upload/inline]", message, error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
