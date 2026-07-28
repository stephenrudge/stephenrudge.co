import { BlogImage, MDXImage } from "@/components/mdx/mdx-image";
import { Gallery } from "@/components/gallery";

/** Shared MDX component map for blog posts and admin preview. */
export const mdxComponents = {
  Gallery,
  img: MDXImage,
  Image: MDXImage,
  MDXImage,
  BlogImage,
};
