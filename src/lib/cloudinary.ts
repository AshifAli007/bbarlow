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
};

function flat(publicId: string) {
  return publicId.replace(/\//g, "__");
}

export function imageUrl(publicId: string, opts: ImgOpts = {}): string {
  const { w, h, crop = "fill", gravity = "auto", q = "auto" } = opts;

  if (CLOUD) {
    const t = [
      "f_auto",
      `q_${q}`,
      w ? `w_${w}` : null,
      h ? `h_${h}` : null,
      w || h ? `c_${crop}` : null,
      (w || h) && crop === "fill" ? `g_${gravity}` : null,
      "dpr_auto",
    ]
      .filter(Boolean)
      .join(",");
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}/${publicId}`;
  }

  return `/photos/${flat(publicId)}.jpg`;
}

/** Responsive srcSet for a target display width (Cloudinary only). */
export function srcSet(publicId: string, widths: number[], opts: ImgOpts = {}) {
  if (!CLOUD) return undefined;
  return widths
    .map((w) => `${imageUrl(publicId, { ...opts, w })} ${w}w`)
    .join(", ");
}

export const hasCDN = Boolean(CLOUD);
