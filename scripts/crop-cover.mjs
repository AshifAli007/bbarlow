#!/usr/bin/env node
/**
 * crop-cover.mjs
 * --------------
 * One-off: permanently crop selected photos to their top portion by re-uploading
 * the original with a north-anchored Cloudinary crop, overwriting the same
 * publicId so the crop applies everywhere the photo renders (cover, archive,
 * lightbox). Add entries to CROPS as needed; `keepTop` is the fraction of the
 * original height to keep from the top (0.8 = drop the bottom 20%).
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

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
const PHOTOS_DIR = process.env.PHOTOS_DIR || "/Users/ashif/Pictures/Beth FSU";

cloudinary.config({ cloud_name: CLOUD, api_key: KEY, api_secret: SECRET, secure: true });

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "photos.json"), "utf8")
);
const all = manifest.meets.flatMap((m) => m.photos.map((p) => ({ ...p, meet: m })));

const CROPS = [
  {
    filename:
      "Coach_Cody_Halsey__Elizabeth_Barlow_JIMMY_CARNES1_17_DSC04103.jpg",
    keepTop: 0.8,
  },
];

for (const { filename, keepTop } of CROPS) {
  const p = all.find((x) => x.filename === filename);
  if (!p) {
    console.warn(`  ! not found in manifest: ${filename}`);
    continue;
  }
  const src = path.join(PHOTOS_DIR, filename);
  if (!fs.existsSync(src)) {
    console.warn(`  ! original missing on disk: ${src}`);
    continue;
  }
  const cropH = Math.round(p.h * keepTop);
  await cloudinary.uploader.upload(src, {
    public_id: p.publicId,
    overwrite: true,
    invalidate: true,
    unique_filename: false,
    use_filename: false,
    resource_type: "image",
    transformation: [{ width: p.w, height: cropH, crop: "crop", gravity: "north" }],
    tags: ["beth", p.meet.id, p.meet.season.replace(/\s+/g, "-").toLowerCase()],
    context: {
      meet: p.meet.displayName,
      date: p.meet.dateLabel,
      location: p.meet.location || "",
      athletes: (p.athletes || []).join(", "),
    },
  });
  console.log(`  cropped ${filename}: ${p.w}x${p.h} -> ${p.w}x${cropH} (top ${keepTop * 100}%)`);
}

console.log("\nDone.");
