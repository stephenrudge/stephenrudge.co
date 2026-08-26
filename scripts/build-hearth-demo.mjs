#!/usr/bin/env node
/**
 * Builds Hearth & Ember Co. as a static export and copies it into public/demos/
 * so the portfolio iframe works without a separate dev server.
 *
 * Requires hearth-ember-co at ~/Projects/hearth-ember-co (override with HEARTH_EMBER_PATH).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.resolve(__dirname, "..");
const hearthRoot =
  process.env.HEARTH_EMBER_PATH ||
  path.join(os.homedir(), "Projects", "hearth-ember-co");
const dest = path.join(websiteRoot, "public", "demos", "hearth-ember-co");

const exportConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/demos/hearth-ember-co",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
`;

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

if (!fs.existsSync(hearthRoot)) {
  console.error(`Hearth & Ember not found at ${hearthRoot}`);
  console.error("Set HEARTH_EMBER_PATH or clone/build manually.");
  process.exit(1);
}

const configPath = path.join(hearthRoot, "next.config.ts");
const backupPath = path.join(hearthRoot, "next.config.ts.portfolio-backup");
const hadBackup = fs.existsSync(backupPath);

if (!hadBackup) {
  fs.copyFileSync(configPath, backupPath);
}

try {
  fs.writeFileSync(configPath, exportConfig);
  console.log("Building static export…");
  run("npm run build", hearthRoot);

  const outDir = path.join(hearthRoot, "out");
  if (!fs.existsSync(outDir)) {
    throw new Error("Build did not produce an out/ directory.");
  }

  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(outDir, dest, { recursive: true });
  console.log(`Copied demo to ${dest}`);
} finally {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, configPath);
    if (!hadBackup) fs.unlinkSync(backupPath);
  }
}
