// Home feed demo content — the posts backend doesn't exist yet
// (Offleash blueprint §5: GET /api/posts?near=<lng,lat>&radiusKm=2).
// Swap these for real API calls once the posts router lands.

export type PostType = "walk-request" | "lost" | "recommend" | "question";

export interface Post {
  id: string;
  author: string;
  initial: string;
  type: PostType;
  timeAgo: string;
  distance: string;
  body: string;
  reactions: number;
  comments: number;
  topComment?: { author: string; initial: string; body: string; timeAgo: string };
}

export const posts: Post[] = [
  {
    id: "p1", author: "Jordan", initial: "J", type: "lost",
    timeAgo: "40 min ago", distance: "600 m",
    body: "Beagle named Pickles slipped his collar near the park entrance around 8. Very friendly, will come to treats. Please check backyards and under porches.",
    reactions: 14, comments: 5,
  },
  {
    id: "p2", author: "Maya", initial: "M", type: "walk-request",
    timeAgo: "2 h", distance: "700 m",
    body: "Looking for a weekday morning walk buddy, around 7. Biscuit is a 2-year-old lab mix, medium energy, great with everyone.",
    reactions: 8, comments: 3,
    topComment: { author: "Sarah", initial: "S", body: "Mochi and I do 7:15 on Tuesdays and Thursdays, want to join?", timeAgo: "1 h" },
  },
  {
    id: "p3", author: "Dev", initial: "D", type: "recommend",
    timeAgo: "5 h", distance: "1.1 km",
    body: "The off-leash area finally has a water fountain that works. Go before 8 if your dog is shy — it fills up fast after.",
    reactions: 21, comments: 6,
  },
  {
    id: "p4", author: "Priya", initial: "P", type: "question",
    timeAgo: "yesterday", distance: "1.4 km",
    body: "Any vet around here that's good with anxious huskies? Rocco hates the one we've been going to.",
    reactions: 4, comments: 11,
  },
];

export const busySpots = [
  { name: "Riverside off-leash", walks: 31 },
  { name: "Maple Park", walks: 18 },
  { name: "Lakeshore trail", walks: 9 },
];

export function fmtDistance(m: number) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}
