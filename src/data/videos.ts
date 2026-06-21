export type Video = {
  /** YouTube video id */
  id: string;
  /** Short title shown on the card */
  title: string;
  /** Long event name */
  event: string;
  /** Links to a meet id in photos.json, when one exists */
  meetId?: string;
  year: number;
  distance?: string;
  /** The "read" beat: her result, kept in sync with races.ts */
  result?: string;
  /** What the footage is: full replay, stream, news segment, etc. */
  note?: string;
  /** Canonical watch URL */
  youtube: string;
  /**
   * Which still to use as the poster. 0 (or omitted) = the official thumbnail;
   * 1/2/3 = YouTube's auto-captured frames at roughly 25% / 50% / 75%.
   */
  thumb?: 0 | 1 | 2 | 3;
};

// Hand-mapped to existing meets/results so the section can pair footage with
// her actual time and place. Order = how they appear in the strip.
export const videos: Video[] = [
  {
    id: "mmT_FeMbk08",
    title: "Nuttycombe Invitational",
    event: "Women's 6K 'A' Race · Nuttycombe Wisconsin Invitational",
    meetId: "nuttycombe",
    year: 2024,
    distance: "6K",
    result: "20:52.2 · 39th",
    note: "Full replay",
    youtube: "https://www.youtube.com/watch?v=mmT_FeMbk08",
    thumb: 3,
  },
  {
    id: "QUECbrZHIRQ",
    title: "Wisconsin Pre-Nationals",
    event: "Women's A 6K XC · NCAA DI Wisconsin Pre-Nationals",
    meetId: "pre-nationals",
    year: 2024,
    distance: "6K",
    result: "20:22.5 · 65th · PB",
    note: "Full replay",
    youtube: "https://www.youtube.com/watch?v=QUECbrZHIRQ",
    thumb: 1,
  },
  {
    id: "5_tq0a_eVeU",
    title: "NCAA DI South Region",
    event: "DI Women's NCAA Cross Country South Regional",
    meetId: "ncaa-south-region",
    year: 2024,
    distance: "6K",
    result: "20:25.4 · 17th · All-Region",
    note: "Full race",
    youtube: "https://www.youtube.com/watch?v=5_tq0a_eVeU",
  },
  {
    id: "l77_d678sA0",
    title: "Jimmy Carnes Invitational",
    event: "Jimmy Carnes Invitational · Friday (College)",
    meetId: "jimmy-carnes",
    year: 2025,
    distance: "Mile",
    result: "4:45.16",
    note: "Full stream",
    youtube: "https://www.youtube.com/watch?v=l77_d678sA0",
    thumb: 3,
  },
  {
    id: "W6ujV_ekMzM",
    title: "PNC Lenny Lyles Invite",
    event: "Lenny Lyles Invitational · Louisville",
    meetId: "lenny-lyles",
    year: 2025,
    distance: "3000m",
    result: "9:16.64 · 3rd",
    note: "News segment",
    youtube: "https://www.youtube.com/watch?v=W6ujV_ekMzM",
    thumb: 1,
  },
  {
    id: "YUDg5lnOwZ8",
    title: "ESAA Championships",
    event: "ESAA Championships · Junior Girls 1500m",
    year: 2014,
    distance: "1500m",
    note: "Age 14 · champion + interview",
    youtube: "https://www.youtube.com/watch?v=YUDg5lnOwZ8",
    thumb: 1,
  },
];

/** maxres is sharper but not always generated; hq always exists. */
export function thumbUrl(id: string, quality: "maxres" | "hq" = "maxres"): string {
  return `https://i.ytimg.com/vi/${id}/${quality}default.jpg`;
}

/**
 * Poster URL for a given frame. Frame 0 is the official thumbnail (high-res,
 * with fallback handled by the caller); frames 1-3 are mid-video grabs, only
 * available up to hq resolution (480x360).
 */
export function frameUrl(id: string, frame: 0 | 1 | 2 | 3 = 0): string {
  if (!frame) return thumbUrl(id, "maxres");
  return `https://i.ytimg.com/vi/${id}/hq${frame}.jpg`;
}

export function embedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}
