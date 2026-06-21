#!/usr/bin/env node
/**
 * One-off: take the inverted runner art (garnet runner on cream), center-crop to
 * a square, key out the cream background to transparency, and emit the app icons.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC =
  "/Users/ashif/.cursor/projects/Users-ashif-Documents-projects-animation-sites/assets/favicon-runner-inverted.png";
const APP = path.join(ROOT, "src", "app");

const meta = await sharp(SRC).metadata();
const side = Math.min(meta.width, meta.height);
const left = Math.round((meta.width - side) / 2);
const top = Math.round((meta.height - side) / 2);

const { data, info } = await sharp(SRC)
  .extract({ left, top, width: side, height: side })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

// Sample the background colour from the four corners.
const corners = [
  [2, 2],
  [width - 3, 2],
  [2, height - 3],
  [width - 3, height - 3],
];
let br = 0, bg = 0, bb = 0;
for (const [x, y] of corners) {
  const i = (y * width + x) * channels;
  br += data[i];
  bg += data[i + 1];
  bb += data[i + 2];
}
br /= corners.length;
bg /= corners.length;
bb /= corners.length;

// Feathered alpha: fully transparent near the background colour, fully opaque
// once the pixel is clearly different (the garnet runner / gold line).
const T0 = 38; // distance below which it's treated as background
const T1 = 80; // distance above which it's fully foreground
for (let p = 0; p < width * height; p++) {
  const i = p * channels;
  const dr = data[i] - br;
  const dg = data[i + 1] - bg;
  const db = data[i + 2] - bb;
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  let a = (dist - T0) / (T1 - T0);
  a = a < 0 ? 0 : a > 1 ? 1 : a;
  data[i + 3] = Math.round(a * 255);
}

const base = sharp(data, { raw: { width, height, channels } }).png();

await base.clone().resize(512, 512).toFile(path.join(APP, "icon.png"));
await base.clone().resize(180, 180).toFile(path.join(APP, "apple-icon.png"));

console.log(`bg ~ rgb(${br.toFixed(0)}, ${bg.toFixed(0)}, ${bb.toFixed(0)}) keyed out`);
console.log("wrote src/app/icon.png (512) and apple-icon.png (180) with transparency");
