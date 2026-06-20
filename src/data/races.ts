export type Race = {
  meet: string;
  /** ISO date of the performance */
  date: string;
  dateLabel: string;
  distance: string;
  time: string;
  place?: string;
  location: string;
  team: "Princeton" | "Florida State" | "Boston College";
  season: string;
  pb?: boolean;
  note?: string;
  /** links this result to a photo meet id in photos.json */
  meetId?: string;
};

/**
 * Cleaned from the source CSVs + verified against TFRRS / World Athletics /
 * team sites. The raw CSV had a URL used as a meet name (PNC Lenny Lyles), a
 * "21:11:50" typo, and section-divider rows — all corrected here. 2024 XC
 * results are added from the FSU record to enrich the photo chapters.
 */
export const races: Race[] = [
  // ---- Cross Country 2024 (Florida State) ----
  {
    meet: "Nuttycombe Invitational",
    date: "2024-09-27",
    dateLabel: "September 27, 2024",
    distance: "6K",
    time: "20:52.2",
    place: "39th",
    location: "Madison, WI",
    team: "Florida State",
    season: "Cross Country 2024",
    meetId: "nuttycombe",
  },
  {
    meet: "Wisconsin Pre-Nationals",
    date: "2024-10-18",
    dateLabel: "October 18, 2024",
    distance: "6K",
    time: "20:22.5",
    place: "65th",
    location: "Madison, WI",
    team: "Florida State",
    season: "Cross Country 2024",
    pb: true,
  },
  {
    meet: "ACC Cross Country Championships",
    date: "2024-11-01",
    dateLabel: "November 1, 2024",
    distance: "6K",
    time: "20:22.8",
    place: "32nd",
    location: "Charlottesville, VA",
    team: "Florida State",
    season: "Cross Country 2024",
    meetId: "acc-xc",
  },
  {
    meet: "NCAA DI South Region Championships",
    date: "2024-11-15",
    dateLabel: "November 15, 2024",
    distance: "6K",
    time: "20:25.4",
    place: "17th",
    location: "Tallahassee, FL",
    team: "Florida State",
    season: "Cross Country 2024",
    note: "All-Region",
    meetId: "ncaa-south-region",
  },
  {
    meet: "NCAA DI Cross Country Championships",
    date: "2024-11-23",
    dateLabel: "November 23, 2024",
    distance: "6K",
    time: "20:59.8",
    place: "176th",
    location: "Verona, WI",
    team: "Florida State",
    season: "Cross Country 2024",
    meetId: "ncaa-xc-champs",
  },

  // ---- Indoor 2025 (Florida State) ----
  {
    meet: "Clemson Invitational",
    date: "2025-01-11",
    dateLabel: "January 11, 2025",
    distance: "Mile",
    time: "4:49.02",
    location: "Clemson, SC",
    team: "Florida State",
    season: "Indoor 2025",
  },
  {
    meet: "Jimmy Carnes Invitational",
    date: "2025-01-17",
    dateLabel: "January 17, 2025",
    distance: "Mile",
    time: "4:45.16",
    location: "Gainesville, FL",
    team: "Florida State",
    season: "Indoor 2025",
    meetId: "jimmy-carnes",
  },
  {
    meet: "PNC Lenny Lyles Invite",
    date: "2025-01-31",
    dateLabel: "January 31, 2025",
    distance: "3000m",
    time: "9:16.64",
    place: "3rd",
    location: "Louisville, KY",
    team: "Florida State",
    season: "Indoor 2025",
    meetId: "lenny-lyles",
  },
  {
    meet: "BU David Hemery Valentine Invitational",
    date: "2025-02-15",
    dateLabel: "February 15, 2025",
    distance: "3000m",
    time: "9:12.29",
    location: "Boston, MA",
    team: "Florida State",
    season: "Indoor 2025",
    pb: true,
    note: "Personal best",
  },
  {
    meet: "ACC Indoor Championships",
    date: "2025-03-02",
    dateLabel: "March 2, 2025",
    distance: "Mile",
    time: "4:44.28",
    location: "Louisville, KY",
    team: "Florida State",
    season: "Indoor 2025",
    pb: true,
    note: "Personal best (prelim)",
    meetId: "acc-indoor",
  },
  {
    meet: "ACC Indoor Championships",
    date: "2025-03-03",
    dateLabel: "March 3, 2025",
    distance: "3000m",
    time: "9:25.08",
    location: "Louisville, KY",
    team: "Florida State",
    season: "Indoor 2025",
    meetId: "acc-indoor",
  },

  // ---- Outdoor 2025 (Florida State) ----
  {
    meet: "FSU Outdoor Opener",
    date: "2025-03-28",
    dateLabel: "March 28, 2025",
    distance: "1500m",
    time: "4:18.75",
    location: "Tallahassee, FL",
    team: "Florida State",
    season: "Outdoor 2025",
    pb: true,
    note: "Personal best",
    meetId: "fsu-relays",
  },
  {
    meet: "ACC Outdoor Championships",
    date: "2025-05-17",
    dateLabel: "May 17, 2025",
    distance: "5000m",
    time: "16:37.82",
    place: "27th",
    location: "Tallahassee, FL",
    team: "Florida State",
    season: "Outdoor 2025",
    pb: true,
    note: "Personal best",
    meetId: "acc-outdoor",
  },

  // ---- Cross Country 2025 (Boston College) ----
  {
    meet: "Loyola Lakefront Invitational",
    date: "2025-10-03",
    dateLabel: "October 3, 2025",
    distance: "6K",
    time: "21:14.94",
    location: "Chicago, IL",
    team: "Boston College",
    season: "Cross Country 2025",
  },
  {
    meet: "Pre-National Meet",
    date: "2025-10-17",
    dateLabel: "October 17, 2025",
    distance: "6K",
    time: "21:11.50",
    location: "Columbia, MO",
    team: "Boston College",
    season: "Cross Country 2025",
  },
  {
    meet: "ACC Championship",
    date: "2025-10-31",
    dateLabel: "October 31, 2025",
    distance: "6K",
    time: "20:37.70",
    location: "Louisville, KY",
    team: "Boston College",
    season: "Cross Country 2025",
  },
  {
    meet: "NCAA Northeast Regional",
    date: "2025-11-14",
    dateLabel: "November 14, 2025",
    distance: "6K",
    time: "20:31.20",
    location: "Contoocook, NH",
    team: "Boston College",
    season: "Cross Country 2025",
  },
  {
    meet: "NCAA Championship",
    date: "2025-11-22",
    dateLabel: "November 22, 2025",
    distance: "6K",
    time: "20:37.0",
    location: "Columbia, MO",
    team: "Boston College",
    season: "Cross Country 2025",
  },

  // ---- Indoor 2026 (Boston College) ----
  {
    meet: "BU Sharon Colyear-Danville Opener",
    date: "2025-12-06",
    dateLabel: "December 6, 2025",
    distance: "3000m",
    time: "9:26.06",
    place: "21st",
    location: "Boston, MA",
    team: "Boston College",
    season: "Indoor 2026",
  },
  {
    meet: "Suffolk ICE Breaker Challenge",
    date: "2026-01-18",
    dateLabel: "January 18, 2026",
    distance: "3000m",
    time: "—",
    location: "Boston, MA",
    team: "Boston College",
    season: "Indoor 2026",
    note: "Upcoming",
  },
];

export const seasonOrder = [
  "Cross Country 2024",
  "Indoor 2025",
  "Outdoor 2025",
  "Cross Country 2025",
  "Indoor 2026",
];

/** Best result linked to a given photo meet id, if any. */
export function resultForMeet(meetId: string): Race | undefined {
  const linked = races.filter((r) => r.meetId === meetId);
  if (!linked.length) return undefined;
  return linked.find((r) => r.pb) || linked[0];
}

export function allResultsForMeet(meetId: string): Race[] {
  return races.filter((r) => r.meetId === meetId);
}
