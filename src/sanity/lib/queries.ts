import { defineQuery } from "next-sanity";

const postFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  date,
  excerpt,
  location,
  country,
  countryFlag,
  region,
  tripType,
  tags,
  "coverImage": coverImage.asset->url,
  "coverImageAlt": coverImage.alt,
  lat,
  lng,
  featured,
  scheduledFor,
  "gallery": gallery[]{
    "src": asset->url,
    "alt": coalesce(alt, "")
  },
  body
`;

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc) {
    ${postFields}
  }
`);

export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields}
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current
  }
`);
