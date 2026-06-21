/**
 * Image URL builder.
 *
 * Prod: when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set, builds Cloudinary URLs
 * with on-the-fly f_auto/q_auto + responsive resizing.
 *
 * Dev/QA: when no cloud name is set, falls back to locally generated previews
 * in /public/photos (see scripts/local-preview.mjs), so the site renders real
 * imagery before the Cloudinary upload has run.
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export type ImgOpts = {
  w?: number;
  h?: number;
  crop?: "fill" | "fit" | "limit";
  gravity?: "auto" | "face" | "center";
  q?: number | "auto";
  /** raw Cloudinary effect token, e.g. "blur:1500" */
  effect?: string;
  /** omit dpr_auto; used by the LQIP and exact-size preloads for predictable URLs */
  noDpr?: boolean;
};

function flat(publicId: string) {
  return publicId.replace(/\//g, "__");
}

export function imageUrl(publicId: string, opts: ImgOpts = {}): string {
  const { w, h, crop = "fill", gravity = "auto", q = "auto", effect, noDpr } = opts;

  if (CLOUD) {
    const t = [
      "f_auto",
      `q_${q}`,
      w ? `w_${w}` : null,
      h ? `h_${h}` : null,
      w || h ? `c_${crop}` : null,
      (w || h) && crop === "fill" ? `g_${gravity}` : null,
      effect ? `e_${effect}` : null,
      noDpr ? null : "dpr_auto",
    ]
      .filter(Boolean)
      .join(",");
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}/${publicId}`;
  }

  return `/photos/${flat(publicId)}.jpg`;
}

/**
 * Tiny, heavily-blurred placeholder (~1KB). Shown instantly behind a full image
 * so transitions never reveal a black frame while the sharp image loads.
 */
export function lqip(publicId: string): string {
  return imageUrl(publicId, { w: 40, crop: "limit", effect: "blur:1500", q: 30, noDpr: true });
}

/**
 * Bucket the needed lightbox width into a small set of values so we reuse a
 * handful of Cloudinary transforms (cheaper, better cache hits) instead of
 * generating a unique size per device.
 */
export function lightboxWidth(vw: number, vh: number, dpr = 1): number {
  // the lightbox image is constrained to ~92vw / ~80vh; size to the larger edge
  const needed = Math.max(vw * 0.92, vh * 0.8) * Math.min(dpr, 2);
  const buckets = [800, 1200, 1600, 2000];
  return buckets.find((b) => b >= needed) ?? buckets[buckets.length - 1];
}

/** Streaming URL for a self-hosted clip stored on Cloudinary. */
export function videoUrl(publicId: string): string {
  if (CLOUD) {
    return `https://res.cloudinary.com/${CLOUD}/video/upload/f_auto,q_auto/${publicId}.mp4`;
  }
  return `/videos/${flat(publicId)}.mp4`;
}

/** Poster frame (still) grabbed from a Cloudinary video at `second` seconds. */
export function videoPoster(publicId: string, second = 0, opts: ImgOpts = {}): string {
  if (CLOUD) {
    const { w, h, crop = "fill", gravity = "auto" } = opts;
    const t = [
      "f_auto",
      "q_auto",
      `so_${second}`,
      w ? `w_${w}` : null,
      h ? `h_${h}` : null,
      w || h ? `c_${crop}` : null,
      (w || h) && crop === "fill" ? `g_${gravity}` : null,
    ]
      .filter(Boolean)
      .join(",");
    return `https://res.cloudinary.com/${CLOUD}/video/upload/${t}/${publicId}.jpg`;
  }
  return `/videos/${flat(publicId)}.jpg`;
}

/** Responsive srcSet for a target display width (Cloudinary only). */
export function srcSet(publicId: string, widths: number[], opts: ImgOpts = {}) {
  if (!CLOUD) return undefined;
  return widths
    .map((w) => `${imageUrl(publicId, { ...opts, w })} ${w}w`)
    .join(", ");
}

export const hasCDN = Boolean(CLOUD);
