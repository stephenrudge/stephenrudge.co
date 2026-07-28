import { defineLive } from "next-sanity/live";
import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    // Live API needs a non-CDN client when draft mode is on.
    useCdn: false,
  }),
  serverToken: token,
  browserToken: token,
});
