#!/usr/bin/env node
/**
 * upload-cloudinary.mjs
 * ---------------------
 * Pushes the original photos to Cloudinary at the exact `publicId`s recorded in
 * src/data/photos.json (produced by parse-photos.mjs). The site builds image
 * URLs from those ids, so this step is purely "ship the bytes".
 *
 * Idempotent: existing assets are skipped (overwrite:false), so you can re-run
 * to resume an interrupted upload.
 *
 * Requires (in .env):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   PHOTOS_DIR   (folder of originals)
 *
 *   node scripts/upload-cloudinary.mjs
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

if (!CLOUD || !KEY || !SECRET) {
  console.error("\nMissing Cloudinary credentials. Set these in .env:\n");
  console.error("  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name");
  console.error("  CLOUDINARY_API_KEY=...");
  console.error("  CLOUDINARY_API_SECRET=...\n");
  console.error("Create a free account at https://cloudinary.com and copy these");
  console.error("from Settings -> API Keys. Then re-run: npm run photos:upload\n");
  process.exit(1);
}

cloudinary.config({ cloud_name: CLOUD, api_key: KEY, api_secret: SECRET, secure: true });

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "photos.json"), "utf8")
);

const all = manifest.meets.flatMap((m) =>
  m.photos.map((p) => ({ ...p, meet: m }))
);

console.log(`Uploading ${all.length} photos to cloud "${CLOUD}"...\n`);

let done = 0;
let skipped = 0;
let failed = 0;
const CONCURRENCY = 6;

async function uploadOne(p) {
  const file = path.join(PHOTOS_DIR, p.filename);
  if (!fs.existsSync(file)) {
    console.warn(`  ! missing file: ${p.filename}`);
    failed++;
    return;
  }
  try {
    await cloudinary.uploader.upload(file, {
      public_id: p.publicId,
      overwrite: false,
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
    done++;
  } catch (err) {
    if (String(err?.message || err).includes("already exists")) {
      skipped++;
    } else {
      console.warn(`  ! failed ${p.filename}: ${err?.message || err}`);
      failed++;
    }
  }
  const total = done + skipped + failed;
  if (total % 20 === 0 || total === all.length) {
    process.stdout.write(`  ${total}/${all.length} (uploaded ${done}, skipped ${skipped}, failed ${failed})\r`);
  }
}

async function run() {
  const queue = [...all];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const p = queue.shift();
      await uploadOne(p);
    }
  });
  await Promise.all(workers);
  console.log(`\n\nDone. Uploaded ${done}, skipped ${skipped} (already existed), failed ${failed}.`);
  if (failed === 0) {
    console.log("All photos are live on Cloudinary. The site will load them automatically.");
  }
}

run();
