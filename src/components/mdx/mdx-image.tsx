import Image from "next/image";
import { cn } from "@/lib/utils";

export type MDXImageProps = {
  src?: string;
  alt?: string;
  /** Markdown title (`![alt](src "caption")`) maps here. */
  title?: string;
  /** Explicit caption for `<BlogImage caption="..." />`. */
  caption?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
};

/**
 * Editorial inline image for MDX/Markdown bodies.
 * Used for `![alt](src "caption")` via the `img` mapping and as `<BlogImage />`.
 */
export function MDXImage({
  src = "",
  alt = "",
  title,
  caption,
  className,
  width,
  height,
}: MDXImageProps) {
  if (!src) return null;

  const label = caption || title || undefined;
  const numericWidth =
    typeof width === "number"
      ? width
      : typeof width === "string" && /^\d+$/.test(width)
        ? Number(width)
        : 1200;
  const numericHeight =
    typeof height === "number"
      ? height
      : typeof height === "string" && /^\d+$/.test(height)
        ? Number(height)
        : 800;

  return (
    <figure
      className={cn(
        "not-prose my-10 mx-auto w-full max-w-full",
        className,
      )}
    >
      <div className="overflow-hidden rounded-xl shadow-md shadow-zinc-900/10 dark:shadow-black/40">
        <Image
          src={src}
          alt={alt || label || "Travel photo"}
          width={numericWidth}
          height={numericHeight}
          sizes="(max-width: 768px) 100vw, 720px"
          className="h-auto w-full max-w-full object-contain"
          style={{ width: "100%", height: "auto" }}
          loading="lazy"
        />
      </div>
      {label ? (
        <figcaption className="mt-3 text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** JSX alias for MDX bodies: `<BlogImage src="..." alt="..." caption="..." />`. */
export function BlogImage(props: MDXImageProps) {
  return <MDXImage {...props} />;
}
