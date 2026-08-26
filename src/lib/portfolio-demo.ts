import fs from "node:fs";
import path from "node:path";

export async function isDemoReachable(url: string) {
  if (!url) return false;
  try {
    const target = url.startsWith("/")
      ? new URL(
          url,
          process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://127.0.0.1:3000",
        ).href
      : url;
    const res = await fetch(target, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export function isBundledDemoAvailable(demoPath: string) {
  if (!demoPath.startsWith("/")) return false;
  const relative = demoPath.replace(/^\//, "");
  const file = path.join(process.cwd(), "public", relative);
  return fs.existsSync(file);
}
