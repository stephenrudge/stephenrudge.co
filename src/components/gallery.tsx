"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryProps {
  images: { src: string; alt: string }[];
}

export function Gallery({ images }: GalleryProps) {
  const [index, setIndex] = useState(0);

  if (!images?.length) return null;

  const current = images[index];

  return (
    <div className="my-10">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
              onClick={() =>
                setIndex((value) => (value === 0 ? images.length - 1 : value - 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
              onClick={() =>
                setIndex((value) => (value === images.length - 1 ? 0 : value + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {images.map((image, i) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show image ${i + 1}`}
            className={cn(
              "h-1.5 w-6 transition-colors",
              i === index ? "bg-accent" : "bg-zinc-300 dark:bg-zinc-700",
            )}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
