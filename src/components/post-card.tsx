"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import type { Post } from "@/types";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {post.countryFlag} {post.location}
            </span>
            <span>{formatDate(post.date)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime}
            </span>
          </div>
          <h3 className="font-serif text-xl leading-snug text-zinc-900 transition-colors group-hover:text-accent dark:text-zinc-50">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
