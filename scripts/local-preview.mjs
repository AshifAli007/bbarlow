#!/usr/bin/env node
/**
 * local-preview.mjs
 * -----------------
 * Generates web-sized local copies of the originals into /public/photos so the
 * site can render real imagery during development BEFORE the Cloudinary upload
 * has run. Uses macOS `sips` (no dependency). These files are gitignored — in
 * production the site loads from Cloudinary instead.
 *
 *   node scripts/local-preview.mjs [maxWidth=1400]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const PHOTOS_DIR = process.env.PHOTOS_DIR || "/Users/ashif/Pictures/Beth FSU";
const MAX = Number(process.argv[2] || 1400);
const OUT = path.join(ROOT, "public", "photos");

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "photos.json"), "utf8")
);
const all = manifest.meets.flatMap((m) => m.photos);

fs.mkdirSync(OUT, { recursive: true });
console.log(`Generating ${all.length} local previews (max ${MAX}px) -> public/photos`);

let done = 0;
let skipped = 0;
for (const p of all) {
  const src = path.join(PHOTOS_DIR, p.filename);
  const dest = path.join(OUT, `${p.publicId.replace(/\//g, "__")}.jpg`);
  if (fs.existsSync(dest)) {
    skipped++;
    done++;
    continue;
  }
  if (!fs.existsSync(src)) {
    console.warn(`  ! missing ${p.filename}`);
    continue;
  }
  try {
    execFileSync("sips", ["-Z", String(MAX), "-s", "format", "jpeg", "-s", "formatOptions", "72", src, "--out", dest], {
      stdio: "ignore",
    });
    done++;
    if (done % 25 === 0) process.stdout.write(`  ${done}/${all.length}\r`);
  } catch (err) {
    console.warn(`  ! failed ${p.filename}: ${err?.message || err}`);
  }
}

console.log(`\nDone. ${done} previews (${skipped} already existed) in ${OUT}`);
