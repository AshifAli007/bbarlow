export type PB = {
  event: string;
  time: string;
  date: string;
  venue: string;
  note?: string;
  flagship?: boolean;
};

export type JourneyStop = {
  place: string;
  school: string;
  years: string;
  blurb: string;
  /** rough lat/lng for the map line (decimal degrees) */
  coord: [number, number];
};

export const profile = {
  firstName: "Beth",
  lastName: "Barlow",
  nickname: "Beth",
  fullName: "Beth Barlow",
  discipline: "Distance Runner",
  hometown: "Manchester, England",
  country: "Great Britain",
  born: "April 8, 2000",
  major: "Psychology",
  currentTeam: "Boston College",
  intro:
    "Beth grew up racing on the cross-country fields of Manchester, then carried it across the Atlantic through three universities and onto some of the fastest tracks in American college running. Two national titles and a 3000m in 9:12.29 later, she is still chasing the next one.",
  manifesto: [
    "Ask Beth why she runs and you probably will not get a tidy answer. The truth is closer to habit, and to the quiet satisfaction of being good at something genuinely hard.",
    "Her races are the 3000 and the mile indoors, the 5k and cross country outdoors. The medals are nice. The reason she keeps going is simpler than that.",
  ],
  pullQuote:
    "You don't find out who you are at the start line. You find out with 600 metres to go.",
  links: {
    worldAthletics:
      "https://worldathletics.org/athletes/great-britain-ni/elizabeth-barlow-15094108",
    tfrrs: "https://www.tfrrs.org/athletes/8924508/Florida_State/Elizabeth_Barlow.html",
    bostonCollege:
      "https://bceagles.com/sports/womens-cross-country/roster/elizabeth-barlow/26074",
    instagram: "", // add when available
  },
};

export const personalBests: PB[] = [
  {
    event: "3000m",
    time: "9:12.29",
    date: "Feb 15, 2025",
    venue: "Boston University, MA",
    note: "World Athletics score 1086",
    flagship: true,
  },
  { event: "Mile", time: "4:44.28", date: "Mar 2, 2025", venue: "Louisville, KY" },
  { event: "1500m", time: "4:18.75", date: "Mar 28, 2025", venue: "Tallahassee, FL" },
  { event: "5000m", time: "16:37.82", date: "May 17, 2025", venue: "ACC Outdoor" },
  { event: "800m", time: "2:10.83", date: "2025", venue: "East Coast Relays" },
  { event: "6K (XC)", time: "20:22.5", date: "Oct 2024", venue: "Wisconsin Pre-Nationals" },
];

export const journey: JourneyStop[] = [
  {
    place: "Manchester, England",
    school: "Where it started",
    years: "Junior years",
    blurb:
      "Two-time national 1500m champion: Junior Girls in 2014, Senior Girls in 2017. Also a netball player and swimmer before running won out.",
    coord: [53.4808, -2.2426],
  },
  {
    place: "Princeton, NJ",
    school: "Princeton University",
    years: "First NCAA chapter",
    blurb: "Crossed the Atlantic to begin collegiate running in the Ivy League.",
    coord: [40.3431, -74.6551],
  },
  {
    place: "Tallahassee, FL",
    school: "Florida State University",
    years: "2024 – 2025",
    blurb:
      "All-Region honors at the NCAA South Region (17th). Set indoor PBs in the mile and 3000m, and outdoor bests at 800m, 1500m and 5000m.",
    coord: [30.4383, -84.2807],
  },
  {
    place: "Chestnut Hill, MA",
    school: "Boston College",
    years: "2025 – present",
    blurb: "Now a graduate student, racing for the Eagles across country and track.",
    coord: [42.3355, -71.1685],
  },
];

/** Featured photo public ids (overridden gracefully if missing). */
export const featured = {
  hero: "beth/indoor-training/DSC04501___Elizabeth_Barlow___February_28__2025",
  portrait: "beth/outdoor-may/DSC09579__Elizabeth_Barlow__May_03__2025",
};
