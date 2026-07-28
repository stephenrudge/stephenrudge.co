import type { PortableTextBlock } from "@portabletext/types";

export type Region =
  | "North America"
  | "South America"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Oceania";

export type TripType =
  | "Road Trips"
  | "Solo Travel"
  | "Guides"
  | "Photography"
  | "City Breaks";

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  location: string;
  country: string;
  countryFlag: string;
  region: Region;
  tripType: TripType[];
  tags: string[];
  coverImage: string;
  lat: number;
  lng: number;
  featured?: boolean;
  /** When true, the story is hidden from the public site. */
  draft?: boolean;
  /** ISO datetime — post goes live automatically after this time (if not a draft). */
  scheduledFor?: string;
  gallery?: GalleryImage[];
}

export interface Post extends PostFrontmatter {
  slug: string;
  /** Portable Text body from Sanity (inline photos are image blocks). */
  content: PortableTextBlock[];
  readingTime: string;
}

export interface Destination {
  country: string;
  countryFlag: string;
  region: Region;
  cities: string[];
  postCount: number;
  posts: { slug: string; title: string; location: string }[];
}

export interface MapPin {
  slug: string;
  title: string;
  location: string;
  countryFlag: string;
  lat: number;
  lng: number;
}
