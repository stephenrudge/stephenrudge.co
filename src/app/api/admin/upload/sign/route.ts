import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  cloudinaryConfigured,
  createCoverUploadSignature,
} from "@/lib/cloudinary";
import { buildUploadFileName, sanitizeBaseName } from "@/lib/upload";
import {
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
  type AllowedMimeType,
} from "@/lib/upload-constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      {
        error: "Cloudinary is not configured.",
        cloudinary: false,
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      fileName?: string;
      mimeType?: string;
      size?: number;
    } | null;

    const fileName = String(body?.fileName || "upload.jpg");
    const mimeType = String(body?.mimeType || "");
    const size = Number(body?.size || 0);

    if (size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `Image must be ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB or smaller.`,
        },
        { status: 400 },
      );
    }

    let resolvedMime: AllowedMimeType = "image/jpeg";
    if (isAllowedImageType(mimeType)) {
      resolvedMime = mimeType;
    }

    const uniqueName = buildUploadFileName(
      sanitizeBaseName(fileName) || "cover",
      resolvedMime,
    );
    const publicId = uniqueName.replace(/\.[^.]+$/, "");
    const signature = createCoverUploadSignature(publicId);

    return NextResponse.json({
      cloudinary: true,
      ...signature,
      maxBytes: MAX_UPLOAD_BYTES,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sign upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
