#!/usr/bin/env node
/**
 * upload-video.mjs
 * ----------------
 * One-off: upload a self-hosted clip (e.g. a downloaded Instagram reel) to
 * Cloudinary as a video resource, so the site streams it like the photos
 * (f_auto/q_auto) and the repo stays free of large binaries.
 */
import fs from "node:fs";
import path from "node:path";
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

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UPLOADS = [
  {
    file: "/Users/ashif/Downloads/She\u2019s a team player \uD83D\uDE4CElizabeth Barlow reflects on today\u2019s performance #NoleFamily - #OneTribe.mp4",
    publicId: "beth/interviews/elizabeth-barlow-reflects",
  },
];

for (const u of UPLOADS) {
  if (!fs.existsSync(u.file)) {
    console.warn(`  ! file not found: ${u.file}`);
    continue;
  }
  const size = fs.statSync(u.file).size;
  const res = await cloudinary.uploader.upload(u.file, {
    public_id: u.publicId,
    resource_type: "video",
    overwrite: true,
    invalidate: true,
    unique_filename: false,
    use_filename: false,
    tags: ["beth", "interview"],
  });
  console.log(
    `  uploaded (${(size / 1e6).toFixed(1)}MB) -> ${u.publicId}  ${res.width}x${res.height}, ${res.duration}s`
  );
}

console.log("\nDone.");
