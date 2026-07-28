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
  gallery?: GalleryImage[];
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
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
