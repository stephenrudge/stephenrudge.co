import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  cloudinaryConfigured,
  uploadCoverImageToCloudinary,
} from "@/lib/cloudinary";
import {
  absoluteUploadPath,
  buildUploadFileName,
  isUploadBlob,
  publicUploadPath,
  validateImageBlob,
} from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!isUploadBlob(file)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 },
      );
    }

    const mimeType = validateImageBlob(file);
    const originalName =
      "name" in file && typeof file.name === "string" && file.name
        ? file.name
        : `upload.${mimeType.split("/")[1] || "jpg"}`;
    const fileName = buildUploadFileName(originalName, mimeType);
    const bytes = Buffer.from(await file.arrayBuffer());

    if (cloudinaryConfigured()) {
      const uploaded = await uploadCoverImageToCloudinary({
        bytes,
        mimeType,
        fileName,
      });

      return NextResponse.json({
        path: uploaded.url,
        via: "cloudinary",
        publicId: uploaded.publicId,
        message: "Image uploaded and optimized on Cloudinary.",
      });
    }

    // Local fallback when Cloudinary env vars are not set (dev only).
    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        {
          error:
            "Cloudinary is required in production. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel.",
        },
        { status: 400 },
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(absoluteUploadPath(fileName), bytes);
    const publicPath = publicUploadPath(fileName);

    return NextResponse.json({
      path: publicPath,
      via: "local",
      message:
        "Image saved locally. Add Cloudinary env vars for production uploads.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image.";
    console.error("[upload]", message, error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
