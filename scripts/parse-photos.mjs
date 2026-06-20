#!/usr/bin/env node
/**
 * parse-photos.mjs
 * ----------------
 * Reads the folder of original race photos, parses each (messy) filename into a
 * structured record, groups photos into MEETS (keyed by date, enriched from a
 * curated lookup), reads real pixel dimensions via macOS `sips`, and writes a
 * deterministic manifest to src/data/photos.json.
 *
 * The manifest is decoupled from the actual Cloudinary upload: each photo gets a
 * deterministic `publicId` (beth/<meet-slug>/<basename>) so the site can build
 * image URLs immediately, and upload-cloudinary.mjs just pushes the bytes to
 * those exact ids later.
 *
 *   PHOTOS_DIR=/path/to/photos node scripts/parse-photos.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// --- load .env (lightweight, no dependency) ---------------------------------
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
const CLOUD_FOLDER = "beth";

// --- known roster names (to extract who is in each photo) -------------------
const ROSTER = [
  "Elizabeth_Barlow",
  "Agnes_McTighe",
  "Bieke_Schipperan",
  "Bieke_Schipperen",
  "Brooke_Mullins",
  "Suus_Altorf",
  "Rebecca_Bergnes",
  "Addison_Boyer",
  "Coach_Cody_Halsey",
  "Cody_Halsey",
  "Emily_Brown",
  "Nicole_Dinan",
  "Lilly_Moore",
  "Leah_Taylor",
  "Ava_Povich",
];

const MONTHS = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

// --- curated meet lookup: ISO date -> canonical meet ------------------------
// Robust grouping by DATE (almost every filename carries one) rather than the
// inconsistent event tokens. Adjacent dates of the same event share an `id`.
const MEETS = {
  "2024-09-26": { id: "nuttycombe", name: "Nuttycombe Invitational", type: "xc", venue: "Thomas Zimmer Championship Course", location: "Madison, WI", season: "Cross Country 2024" },
  "2024-09-27": { id: "nuttycombe", name: "Nuttycombe Invitational", type: "xc", venue: "Thomas Zimmer Championship Course", location: "Madison, WI", season: "Cross Country 2024" },
  "2024-10-10": { id: "pre-meet-oct", name: "Pre-Meet Shakeout", type: "team", venue: "", location: "Tallahassee, FL", season: "Cross Country 2024" },
  "2024-10-30": { id: "team-portraits", name: "Team Portraits", type: "team", venue: "", location: "Tallahassee, FL", season: "Cross Country 2024" },
  "2024-10-31": { id: "acc-xc", name: "ACC Cross Country Championships", type: "xc", venue: "Panorama Farms", location: "Charlottesville, VA", season: "Cross Country 2024" },
  "2024-11-01": { id: "acc-xc", name: "ACC Cross Country Championships", type: "xc", venue: "Panorama Farms", location: "Charlottesville, VA", season: "Cross Country 2024" },
  "2024-11-11": { id: "practice-nov", name: "Practice", type: "team", venue: "", location: "Tallahassee, FL", season: "Cross Country 2024" },
  "2024-11-15": { id: "ncaa-south-region", name: "NCAA DI South Region Championships", type: "xc", venue: "", location: "Tallahassee, FL", season: "Cross Country 2024" },
  "2024-11-20": { id: "pre-nationals", name: "Pre-Nationals", type: "team", venue: "", location: "Tallahassee, FL", season: "Cross Country 2024" },
  "2024-11-22": { id: "ncaa-xc-champs", name: "NCAA DI Cross Country Championships", type: "xc", venue: "The Thomas Zimmer Course", location: "Verona, WI", season: "Cross Country 2024" },
  "2024-11-23": { id: "ncaa-xc-champs", name: "NCAA DI Cross Country Championships", type: "xc", venue: "The Thomas Zimmer Course", location: "Verona, WI", season: "Cross Country 2024" },
  "2025-01-17": { id: "jimmy-carnes", name: "Jimmy Carnes Invitational", type: "indoor", venue: "", location: "Gainesville, FL", season: "Indoor 2025" },
  "2025-01-28": { id: "indoor-training", name: "Indoor Training Days", type: "team", venue: "", location: "", season: "Indoor 2025" },
  "2025-01-30": { id: "lenny-lyles", name: "PNC Lenny Lyles Invite", type: "indoor", venue: "", location: "Louisville, KY", season: "Indoor 2025" },
  "2025-01-31": { id: "lenny-lyles", name: "PNC Lenny Lyles Invite", type: "indoor", venue: "", location: "Louisville, KY", season: "Indoor 2025" },
  "2025-02-01": { id: "lenny-lyles", name: "PNC Lenny Lyles Invite", type: "indoor", venue: "", location: "Louisville, KY", season: "Indoor 2025" },
  "2025-02-06": { id: "indoor-training", name: "Indoor Training Days", type: "team", venue: "", location: "", season: "Indoor 2025" },
  "2025-02-18": { id: "bu-indoor-feb", name: "Boston University Indoor", type: "indoor", venue: "BU Track & Tennis Center", location: "Boston, MA", season: "Indoor 2025" },
  "2025-02-27": { id: "indoor-training", name: "Indoor Training Days", type: "team", venue: "", location: "", season: "Indoor 2025" },
  "2025-02-28": { id: "indoor-training", name: "Indoor Training Days", type: "team", venue: "", location: "", season: "Indoor 2025" },
  "2025-03-02": { id: "acc-indoor", name: "ACC Indoor Championships", type: "indoor", venue: "Norton Sports Center", location: "Louisville, KY", season: "Indoor 2025" },
  "2025-03-03": { id: "acc-indoor", name: "ACC Indoor Championships", type: "indoor", venue: "Norton Sports Center", location: "Louisville, KY", season: "Indoor 2025" },
  "2025-03-28": { id: "fsu-relays", name: "FSU Outdoor Opener", type: "outdoor", venue: "Mike Long Track", location: "Tallahassee, FL", season: "Outdoor 2025" },
  "2025-04-22": { id: "banquet", name: "Awards Banquet", type: "team", venue: "", location: "Tallahassee, FL", season: "Outdoor 2025" },
  "2025-05-02": { id: "outdoor-may", name: "Outdoor Session", type: "team", venue: "", location: "Tallahassee, FL", season: "Outdoor 2025" },
  "2025-05-03": { id: "outdoor-may", name: "Outdoor Session", type: "team", venue: "", location: "Tallahassee, FL", season: "Outdoor 2025" },
  "2025-05-06": { id: "outdoor-may", name: "Outdoor Session", type: "team", venue: "", location: "Tallahassee, FL", season: "Outdoor 2025" },
  "2025-05-14": { id: "acc-outdoor", name: "ACC Outdoor Championships", type: "outdoor", venue: "", location: "Tallahassee, FL", season: "Outdoor 2025" },
  "2025-05-17": { id: "acc-outdoor", name: "ACC Outdoor Championships", type: "outdoor", venue: "", location: "Tallahassee, FL", season: "Outdoor 2025" },
};

// token shortcuts for filenames that don't carry a full month-name date
const TOKEN_DATES = [
  { re: /JIMMY_CARNES/i, iso: "2025-01-17" },
  { re: /Louisville_1_30/i, iso: "2025-01-30" },
];

const SEASON_ORDER = [
  "Cross Country 2024",
  "Indoor 2025",
  "Outdoor 2025",
  "Cross Country 2025",
  "Indoor 2026",
  "Off the Clock",
];

const OFF_THE_CLOCK = { id: "off-the-clock", name: "Portraits & Teammates", type: "team", venue: "", location: "", season: "Off the Clock" };

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizePublicId(base) {
  return base.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
}

function parseDate(name) {
  const m = name.match(/(January|February|March|April|May|June|July|August|September|October|November|December)_(\d{1,2})_+(\d{4})/);
  if (m) {
    const mm = MONTHS[m[1]];
    const dd = String(m[2]).padStart(2, "0");
    return `${m[3]}-${mm}-${dd}`;
  }
  for (const t of TOKEN_DATES) if (t.re.test(name)) return t.iso;
  return null;
}

function parseAthletes(name) {
  const found = [];
  for (const r of ROSTER) {
    if (name.includes(r)) {
      // normalize spelling variants
      let label = r.replace(/_/g, " ").replace(/^Coach /, "");
      if (label === "Bieke Schipperan") label = "Bieke Schipperen";
      if (!found.includes(label)) found.push(label);
    }
  }
  return found;
}

function parseCode(base) {
  const m = base.match(/(DSC\d+|403A\d+|IMG_?\d+)/i);
  if (m) return m[1];
  const t = base.match(/_(\d{1,3})$/);
  if (t) return t[1];
  return null;
}

function fmtDateLabel(iso) {
  if (!iso) return "Undated";
  const [y, mo, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[mo - 1]} ${d}, ${y}`;
}

// --- read directory ---------------------------------------------------------
if (!fs.existsSync(PHOTOS_DIR)) {
  console.error(`Photos directory not found: ${PHOTOS_DIR}`);
  console.error("Set PHOTOS_DIR in .env to the folder of original photos.");
  process.exit(1);
}

const files = fs
  .readdirSync(PHOTOS_DIR)
  .filter((f) => /\.jpe?g$/i.test(f) && !f.startsWith("."))
  .sort();

console.log(`Found ${files.length} photos in ${PHOTOS_DIR}`);

// --- read dimensions in a single sips pass ----------------------------------
function readDimensions(fileList) {
  const dims = {};
  const CHUNK = 200;
  for (let i = 0; i < fileList.length; i += CHUNK) {
    const chunk = fileList.slice(i, i + CHUNK);
    const out = execFileSync(
      "sips",
      ["-g", "pixelWidth", "-g", "pixelHeight", ...chunk],
      { cwd: PHOTOS_DIR, maxBuffer: 64 * 1024 * 1024 }
    ).toString();
    let current = null;
    for (const line of out.split("\n")) {
      if (!line.startsWith(" ")) {
        const base = path.basename(line.trim());
        if (base) current = base;
      } else if (current) {
        const w = line.match(/pixelWidth:\s*(\d+)/);
        const h = line.match(/pixelHeight:\s*(\d+)/);
        if (w) dims[current] = { ...(dims[current] || {}), w: Number(w[1]) };
        if (h) dims[current] = { ...(dims[current] || {}), h: Number(h[1]) };
      }
    }
  }
  return dims;
}

console.log("Reading pixel dimensions via sips...");
const dims = readDimensions(files);

// --- build records ----------------------------------------------------------
const meetsMap = new Map();
const usedIds = new Set();

for (const file of files) {
  const base = file.replace(/\.[^.]+$/, "");
  const iso = parseDate(file);
  const athletes = parseAthletes(file);
  const code = parseCode(base);

  const meta = (iso && MEETS[iso]) || (iso ? null : OFF_THE_CLOCK);
  // uncurated but dated -> generic meet keyed by its date
  const resolved = meta || {
    id: `meet-${iso}`,
    name: fmtDateLabel(iso),
    type: "team",
    venue: "",
    location: "",
    season: iso < "2025-06" ? (iso < "2025-01" ? "Cross Country 2024" : (iso < "2025-04" ? "Indoor 2025" : "Outdoor 2025")) : "Off the Clock",
  };

  if (!meetsMap.has(resolved.id)) {
    meetsMap.set(resolved.id, {
      id: resolved.id,
      slug: slugify(resolved.id),
      displayName: resolved.name,
      type: resolved.type,
      season: resolved.season,
      venue: resolved.venue,
      location: resolved.location,
      dates: new Set(),
      photos: [],
    });
  }
  const meet = meetsMap.get(resolved.id);
  if (iso) meet.dates.add(iso);

  const dim = dims[file] || { w: 1600, h: 1067 };
  let pid = `${CLOUD_FOLDER}/${meet.slug}/${sanitizePublicId(base)}`;
  while (usedIds.has(pid)) pid += "_x";
  usedIds.add(pid);

  const isBeth = athletes.includes("Elizabeth Barlow");
  meet.photos.push({
    publicId: pid,
    filename: file,
    w: dim.w,
    h: dim.h,
    orientation: dim.w > dim.h ? "landscape" : dim.w < dim.h ? "portrait" : "square",
    athletes,
    solo: isBeth && athletes.length === 1,
    code,
    dateISO: iso,
  });
}

// --- finalize meets ---------------------------------------------------------
const meets = [...meetsMap.values()].map((m) => {
  const dates = [...m.dates].sort();
  const dateISO = dates[0] || null;
  const dateEnd = dates[dates.length - 1] || null;
  // cover: prefer a solo landscape, else any landscape, else first
  const cover =
    m.photos.find((p) => p.solo && p.orientation === "landscape") ||
    m.photos.find((p) => p.orientation === "landscape") ||
    m.photos.find((p) => p.solo) ||
    m.photos[0];
  return {
    id: m.id,
    slug: m.slug,
    displayName: m.displayName,
    type: m.type,
    season: m.season,
    venue: m.venue,
    location: m.location,
    dateISO,
    dateLabel:
      dateEnd && dateEnd !== dateISO
        ? `${fmtDateLabel(dateISO)} – ${fmtDateLabel(dateEnd)}`
        : fmtDateLabel(dateISO),
    photoCount: m.photos.length,
    cover: cover ? cover.publicId : null,
    photos: m.photos,
  };
});

// sort: chronological, undated (Off the Clock) last
meets.sort((a, b) => {
  if (!a.dateISO) return 1;
  if (!b.dateISO) return -1;
  return a.dateISO.localeCompare(b.dateISO);
});

const seasons = SEASON_ORDER.filter((s) => meets.some((m) => m.season === s));

const manifest = {
  generatedAt: new Date().toISOString(),
  cloudFolder: CLOUD_FOLDER,
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null,
  totals: { photos: files.length, meets: meets.length },
  seasons,
  meets,
};

const outPath = path.join(ROOT, "src", "data", "photos.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

console.log(`\nWrote ${outPath}`);
console.log(`Meets (${meets.length}):`);
for (const m of meets) {
  console.log(`  ${(m.dateLabel || "").padEnd(26)} ${String(m.photoCount).padStart(3)}  ${m.displayName}  [${m.season}]`);
}
