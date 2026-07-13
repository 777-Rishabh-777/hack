export type Fixture = {
  label: string;
  detail: string;
  time: string;
};

export type TeamInfo = {
  group: string;
  homeTeam: string;
  awayTeam: string;
  ranking: {
    home: string;
    away: string;
  };
};

export type HostCity = {
  id: string;
  name: string;
  country: string;
  position: {
    lat: number;
    lng: number;
  };
  camera: {
    heading: number;
    tilt: number;
    zoom: number;
  };
  stadium: string;
  stadiumNote: string;
  capacity: string;
  image: string;
  teamInfo: TeamInfo;
  match: string;
  status: string;
  accent: string;
  fixtures: Fixture[];
};

export const hostCities: HostCity[] = [
  {
    id: "NYC",
    name: "New York",
    country: "United States",
    position: { lat: 40.8136, lng: -74.0745 },
    camera: { heading: 24, tilt: 68, zoom: 12.2 },
    stadium: "MetLife Stadium",
    stadiumNote: "Massive skyline arrival • premium fan corridor • AI analytics deck",
    capacity: "82,500",
    image: "/stadiums/metlife.jpg",
    teamInfo: {
      group: "Group A",
      homeTeam: "United States",
      awayTeam: "Brazil",
      ranking: {
        home: "#12",
        away: "#5",
      },
    },
    match: "Global showcase opener • USA vs Brazil",
    status: "Launch city",
    accent: "#22d3ee",
    fixtures: [
      {
        label: "Opening lights",
        detail: "Skyline kickoff ceremony",
        time: "Aug 17 • 19:00 UTC",
      },
      {
        label: "Fan pulse stream",
        detail: "Spatial crowd projection",
        time: "Aug 18 • 21:00 UTC",
      },
      {
        label: "North America finals",
        detail: "Elite conference match",
        time: "Aug 20 • 18:30 UTC",
      },
    ],
  },
  {
    id: "DAL",
    name: "Dallas",
    country: "United States",
    position: { lat: 32.7473, lng: -97.0945 },
    camera: { heading: 10, tilt: 66, zoom: 12.4 },
    stadium: "AT&T Stadium",
    stadiumNote: "Orbital dome • rapid transfer network • immersive stadium score wall",
    capacity: "80,000",
    image: "/stadiums/att.jpg",
    teamInfo: {
      group: "Group B",
      homeTeam: "Argentina",
      awayTeam: "Portugal",
      ranking: {
        home: "#1",
        away: "#7",
      },
    },
    match: "Texas derby • Argentina vs Portugal",
    status: "High-velocity host",
    accent: "#7c3aed",
    fixtures: [
      {
        label: "Stadium command",
        detail: "AI route control sync",
        time: "Aug 19 • 20:30 UTC",
      },
      {
        label: "Midnight match",
        detail: "Prime time heat map",
        time: "Aug 21 • 23:00 UTC",
      },
      {
        label: "Satellite feed",
        detail: "Crowd-to-pitch motion analysis",
        time: "Aug 23 • 19:45 UTC",
      },
    ],
  },
  {
    id: "LAX",
    name: "Los Angeles",
    country: "United States",
    position: { lat: 33.9535, lng: -118.339 },
    camera: { heading: 18, tilt: 66, zoom: 12.5 },
    stadium: "SoFi Stadium",
    stadiumNote: "Oceanfront tech campus • AR fan overlays • smart transport lane",
    capacity: "70,240",
    image: "/stadiums/sofi.jpg",
    teamInfo: {
      group: "Group C",
      homeTeam: "France",
      awayTeam: "Morocco",
      ranking: {
        home: "#2",
        away: "#13",
      },
    },
    match: "Coastal final • France vs Morocco",
    status: "Visionary venue",
    accent: "#f97316",
    fixtures: [
      {
        label: "Sunset forecast",
        detail: "Climate-aware crowd routing",
        time: "Aug 18 • 22:00 UTC",
      },
      {
        label: "Vivid media hub",
        detail: "Global broadcast rehearsal",
        time: "Aug 20 • 17:15 UTC",
      },
      {
        label: "Neon finale",
        detail: "Pitch telemetry showcase",
        time: "Aug 24 • 23:00 UTC",
      },
    ],
  },
  {
    id: "TOR",
    name: "Toronto",
    country: "Canada",
    position: { lat: 43.6332, lng: -79.4186 },
    camera: { heading: 30, tilt: 67, zoom: 12.6 },
    stadium: "BMO Field",
    stadiumNote: "Lakefront fan district • live AI translation kiosks • stadium climate mesh",
    capacity: "30,000",
    image: "/stadiums/bmo.jpg",
    teamInfo: {
      group: "Group D",
      homeTeam: "Canada",
      awayTeam: "Germany",
      ranking: {
        home: "#40",
        away: "#11",
      },
    },
    match: "Northern summit • Canada vs Germany",
    status: "Gateway city",
    accent: "#14b8a6",
    fixtures: [
      {
        label: "Harbor pulse",
        detail: "Transit concurrency view",
        time: "Aug 20 • 16:00 UTC",
      },
      {
        label: "Data tunnel",
        detail: "Predictive crowd flow",
        time: "Aug 22 • 20:15 UTC",
      },
      {
        label: "Regional semi",
        detail: "AI tactical corridor",
        time: "Aug 25 • 18:45 UTC",
      },
    ],
  },
  {
    id: "MEX",
    name: "Mexico City",
    country: "Mexico",
    position: { lat: 19.3029, lng: -99.1505 },
    camera: { heading: 6, tilt: 65, zoom: 12.8 },
    stadium: "Estadio Azteca",
    stadiumNote: "Cultural icon • legacy venue • immersive tunnel experience",
    capacity: "87,523",
    image: "/stadiums/azteca.jpg",
    teamInfo: {
      group: "Group E",
      homeTeam: "Mexico",
      awayTeam: "Uruguay",
      ranking: {
        home: "#15",
        away: "#8",
      },
    },
    match: "Altitude challenge • Mexico vs Uruguay",
    status: "Heritage venue",
    accent: "#ef4444",
    fixtures: [
      {
        label: "High-altitude analysis",
        detail: "Recovery rhythm overview",
        time: "Aug 18 • 18:30 UTC",
      },
      {
        label: "Legacy match",
        detail: "Crowd signal snapshot",
        time: "Aug 22 • 21:30 UTC",
      },
      {
        label: "Final descent",
        detail: "Forecasted stadium surge",
        time: "Aug 24 • 19:15 UTC",
      },
    ],
  },
];
