import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, ArrowRight, Clock, MapPin } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import { PostMap } from "@/components/map/map-section";
import { Gallery } from "@/components/gallery";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

const components = {
  Gallery,
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);

  return (
    <article>
      <header className="relative isolate min-h-[70vh] overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {post.countryFlag} {post.location}, {post.country}
            </span>
            <span>{formatDate(post.date)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">{post.excerpt}</p>
          <div className="mt-6">
            <ShareButtons title={post.title} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-accent">
          <MDXRemote source={post.content} components={components} />
        </div>

        {post.gallery && post.gallery.length > 0 ? (
          <Gallery images={post.gallery} />
        ) : null}

        <PostMap
          pin={{
            slug: post.slug,
            title: post.title,
            location: post.location,
            countryFlag: post.countryFlag,
            lat: post.lat,
            lng: post.lng,
          }}
        />

        <nav className="mt-16 grid gap-6 border-t border-zinc-200 pt-10 sm:grid-cols-2 dark:border-zinc-800">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className="group space-y-1">
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500">
                <ArrowLeft className="h-3 w-3" />
                Previous
              </span>
              <p className="font-serif text-xl group-hover:text-accent">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group space-y-1 sm:text-right"
            >
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 sm:justify-end">
                Next
                <ArrowRight className="h-3 w-3" />
              </span>
              <p className="font-serif text-xl group-hover:text-accent">
                {next.title}
              </p>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}
