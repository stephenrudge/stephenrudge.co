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

export function getCloudinaryFolder() {
  return process.env.CLOUDINARY_FOLDER?.trim() || "stephenrudge/covers";
}

/** Eager transforms applied on upload (must be included in the signed params). */
export const COVER_EAGER_TRANSFORMATION =
  "c_limit,w_2400,h_1600/q_auto:good,f_auto";

export function createCoverUploadSignature(publicId: string) {
  configureCloudinary();

  const timestamp = Math.round(Date.now() / 1000);
  const folder = getCloudinaryFolder();
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
    public_id: publicId,
    eager: COVER_EAGER_TRANSFORMATION,
    overwrite: "false",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    timestamp,
    signature,
    folder,
    publicId,
    eager: COVER_EAGER_TRANSFORMATION,
  };
}

export async function uploadCoverImageToCloudinary(options: {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
}) {
  configureCloudinary();

  const folder = getCloudinaryFolder();
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
