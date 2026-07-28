"use client";

import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/sanity/lib/image";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const src = urlFor(value).width(1600).fit("max").url();
      const alt = value.alt || value.caption || "Travel photo";
      return (
        <figure className="not-prose my-10 mx-auto w-full max-w-full">
          <div className="overflow-hidden rounded-xl shadow-md shadow-zinc-900/10 dark:shadow-black/40">
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1067}
              sizes="(max-width: 768px) 100vw, 720px"
              className="h-auto w-full max-w-full object-contain"
              style={{ width: "100%", height: "auto" }}
              loading="lazy"
            />
          </div>
          {value.caption ? (
            <figcaption className="mt-3 text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic text-zinc-600 dark:text-zinc-300">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          className="text-accent underline-offset-4 hover:underline"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function PostBody({ value }: { value: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={components} />;
}
