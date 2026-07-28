import { v2 as cloudinary } from "cloudinary";

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configureCloudinary() {
  if (!cloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadCoverImageToCloudinary(options: {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
}) {
  configureCloudinary();

  const folder =
    process.env.CLOUDINARY_FOLDER?.trim() || "stephenrudge/covers";
  const dataUri = `data:${options.mimeType};base64,${options.bytes.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: options.fileName.replace(/\.[^.]+$/, ""),
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
    transformation: [
      { width: 2400, height: 1600, crop: "limit" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary upload succeeded but returned no URL.");
  }

  return {
    url: result.secure_url as string,
    publicId: result.public_id as string,
    width: result.width as number | undefined,
    height: result.height as number | undefined,
    format: result.format as string | undefined,
  };
}
