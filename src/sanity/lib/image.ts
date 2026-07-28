import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Responsive Sanity CDN URLs with automatic format/quality. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format").quality(80);
}

export function coverImageUrl(source: SanityImageSource | null | undefined) {
  if (!source) return "";
  return urlFor(source).width(2400).height(1600).fit("max").url();
}

export function inlineImageUrl(source: SanityImageSource | null | undefined) {
  if (!source) return "";
  return urlFor(source).width(1600).fit("max").url();
}
