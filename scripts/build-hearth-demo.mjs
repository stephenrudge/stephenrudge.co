#!/usr/bin/env node
/**
 * Builds Hearth & Ember Co. as a static export and copies it into public/demos/
 * so the portfolio iframe works without a separate dev server.
 *
 * Requires hearth-ember-co at ~/Projects/hearth-ember-co (override with HEARTH_EMBER_PATH).
 * Uses PORTFOLIO_EXPORT=1 — see hearth-ember-co/next.config.ts (no config overwrite).
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

function run(cmd, cwd, env = {}) {
  execSync(cmd, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

if (!fs.existsSync(hearthRoot)) {
  console.error(`Hearth & Ember not found at ${hearthRoot}`);
  console.error("Set HEARTH_EMBER_PATH or clone/build manually.");
  process.exit(1);
}

console.log("Building static export (PORTFOLIO_EXPORT=1)…");
run("npm run build", hearthRoot, { PORTFOLIO_EXPORT: "1" });

const outDir = path.join(hearthRoot, "out");
if (!fs.existsSync(outDir)) {
  throw new Error("Build did not produce an out/ directory.");
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(outDir, dest, { recursive: true });
console.log(`Copied demo to ${dest}`);
