"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getPortfolioHref, type PortfolioItem } from "@/types/portfolio";
import { cn } from "@/lib/utils";

function PortfolioCardInner({
  item,
  index,
  className,
}: {
  item: PortfolioItem;
  index: number;
  className?: string;
}) {
  const href = getPortfolioHref(item);
  const isExternalDetail = href.startsWith("http");

  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <Image
          src={item.image}
          alt={item.imageAlt || item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <span className="absolute right-3 top-3 rounded-full bg-zinc-950/60 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {item.category ? (
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 dark:border-zinc-700">
              {item.category}
            </span>
          ) : null}
          {item.year ? <span>{item.year}</span> : null}
        </div>
        <h3 className="font-serif text-xl leading-snug text-zinc-900 transition-colors group-hover:text-accent dark:text-zinc-50">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {item.description}
        </p>
      </div>
    </>
  );

  const cardClass = cn(
    "group flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/50",
    className,
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="h-full"
    >
      {isExternalDetail ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          {content}
        </a>
      ) : (
        <Link href={href} className={cardClass}>
          {content}
        </Link>
      )}
    </motion.article>
  );
}

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  if (!items.length) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        Portfolio pieces will appear here soon.
      </p>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <PortfolioCardInner key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
