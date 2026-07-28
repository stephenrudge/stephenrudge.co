import type { Post, Region, TripType } from "@/types";

export function filterPosts(
  posts: Post[],
  region?: Region | "All",
  tripType?: TripType | "All",
): Post[] {
  return posts.filter((post) => {
    const regionMatch = !region || region === "All" || post.region === region;
    const typeMatch =
      !tripType || tripType === "All" || post.tripType.includes(tripType);
    return regionMatch && typeMatch;
  });
}

export const REGIONS: (Region | "All")[] = [
  "All",
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
];

export const TRIP_TYPES: (TripType | "All")[] = [
  "All",
  "Road Trips",
  "Solo Travel",
  "Guides",
  "Photography",
  "City Breaks",
];
