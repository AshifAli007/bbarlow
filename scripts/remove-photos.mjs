#!/usr/bin/env node
/**
 * remove-photos.mjs (one-off)
 * Removes photos listed in REMOVE_DIR from the manifest so they disappear from
 * the whole site (archive, lightbox, covers, strips). Reassigns any cover that
 * pointed at a removed photo, drops emptied meets, and recomputes counts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REMOVE_DIR = "/Users/ashif/Downloads/to remove";
const MANIFEST = path.join(ROOT, "src", "data", "photos.json");

const removeNames = new Set(
  fs.readdirSync(REMOVE_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f))
);

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const allNamesBefore = new Set(
  manifest.meets.flatMap((m) => m.photos.map((p) => p.filename))
);
const notFound = [...removeNames].filter((n) => !allNamesBefore.has(n));

let removed = 0;
const droppedMeets = [];

manifest.meets = manifest.meets.filter((m) => {
  const removedPublicIds = new Set(
    m.photos.filter((p) => removeNames.has(p.filename)).map((p) => p.publicId)
  );
  m.photos = m.photos.filter((p) => !removeNames.has(p.filename));
  removed += removedPublicIds.size;
  m.photoCount = m.photos.length;

  if (m.photos.length === 0) {
    droppedMeets.push(m.displayName);
    return false; // drop empty meet
  }

  // reassign cover if it was removed
  if (m.cover && removedPublicIds.has(m.cover)) {
    const pick =
      m.photos.find((p) => p.solo && p.orientation === "landscape") ||
      m.photos.find((p) => p.orientation === "landscape") ||
      m.photos.find((p) => p.solo) ||
      m.photos[0];
    m.cover = pick ? pick.publicId : null;
    console.log(`  reassigned cover for ${m.displayName} -> ${m.cover}`);
  }
  return true;
});

// recompute totals + seasons
manifest.totals = {
  photos: manifest.meets.reduce((n, m) => n + m.photos.length, 0),
  meets: manifest.meets.length,
};
manifest.seasons = [...new Set(manifest.meets.map((m) => m.season))];

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

console.log(`\nRequested removals: ${removeNames.size}`);
console.log(`Photos removed from manifest: ${removed}`);
if (droppedMeets.length) console.log(`Dropped empty meets: ${droppedMeets.join(", ")}`);
console.log(`New totals: ${manifest.totals.photos} photos, ${manifest.totals.meets} meets`);
if (notFound.length) {
  console.log(`\nNot found in manifest (${notFound.length}):`);
  for (const n of notFound) console.log(`  - ${n}`);
}
