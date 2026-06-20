#!/usr/bin/env node
/**
 * upload-oversized.mjs
 * --------------------
 * One-off: a few originals exceed Cloudinary's free 10MB upload limit. This
 * downscales them locally (sips) to a temp JPEG under the limit and uploads to
 * the same publicId, so the site loads them like any other photo.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

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

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
const PHOTOS_DIR = process.env.PHOTOS_DIR || "/Users/ashif/Pictures/Beth FSU";

cloudinary.config({ cloud_name: CLOUD, api_key: KEY, api_secret: SECRET, secure: true });

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "photos.json"), "utf8")
);
const all = manifest.meets.flatMap((m) => m.photos.map((p) => ({ ...p, meet: m })));

const TARGETS = [
  "DSC04460___Cody_Halsey__Elizabeth_Barlow___April_22__2025.jpg",
  "DSC04301___Elizabeth_Barlow__Leah_Taylor___April_22__2025.jpg",
  "DSC04461___Cody_Halsey__Elizabeth_Barlow___April_22__2025.jpg",
  "DSC04298___Elizabeth_Barlow__Leah_Taylor___April_22__2025.jpg",
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "beth-resize-"));

for (const filename of TARGETS) {
  const p = all.find((x) => x.filename === filename);
  if (!p) {
    console.warn(`  ! not found in manifest: ${filename}`);
    continue;
  }
  const src = path.join(PHOTOS_DIR, filename);
  const out = path.join(tmp, filename);
  // Downscale longest side to 3200px and re-encode JPEG to drop well under 10MB.
  execFileSync("sips", ["-Z", "3200", "-s", "format", "jpeg", src, "--out", out]);
  const size = fs.statSync(out).size;
  await cloudinary.uploader.upload(out, {
    public_id: p.publicId,
    overwrite: true,
    unique_filename: false,
    use_filename: false,
    resource_type: "image",
    tags: ["beth", p.meet.id, p.meet.season.replace(/\s+/g, "-").toLowerCase()],
    context: {
      meet: p.meet.displayName,
      date: p.meet.dateLabel,
      location: p.meet.location || "",
      athletes: (p.athletes || []).join(", "),
    },
  });
  console.log(`  uploaded ${filename} (${(size / 1e6).toFixed(1)}MB) -> ${p.publicId}`);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log("\nDone.");
