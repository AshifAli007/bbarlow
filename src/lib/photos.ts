import data from "@/data/photos.json";

export type Photo = {
  publicId: string;
  filename: string;
  w: number;
  h: number;
  orientation: "landscape" | "portrait" | "square";
  athletes: string[];
  solo: boolean;
  code: string | null;
  dateISO: string | null;
};

export type Meet = {
  id: string;
  slug: string;
  displayName: string;
  type: "xc" | "indoor" | "outdoor" | "team";
  season: string;
  venue: string;
  location: string;
  dateISO: string | null;
  dateLabel: string;
  photoCount: number;
  cover: string | null;
  photos: Photo[];
};

export type PhotoManifest = {
  generatedAt: string;
  cloudFolder: string;
  cloudName: string | null;
  totals: { photos: number; meets: number };
  seasons: string[];
  meets: Meet[];
};

const manifest = data as unknown as PhotoManifest;

export const meets = manifest.meets;
export const seasons = manifest.seasons;
export const totals = manifest.totals;

export const allPhotos: Photo[] = meets.flatMap((m) => m.photos);

export function meetById(id: string): Meet | undefined {
  return meets.find((m) => m.id === id);
}

/** Meets that are actual competitions (have a race-like type), in order. */
export const raceMeets = meets.filter((m) => m.type !== "team");

/** A solo portrait of Beth, useful for editorial features. */
export function soloPhoto(index = 0): Photo | undefined {
  const solos = allPhotos.filter((p) => p.solo);
  return solos[index % Math.max(solos.length, 1)];
}

export function findPhoto(publicId: string): Photo | undefined {
  return allPhotos.find((p) => p.publicId === publicId);
}
