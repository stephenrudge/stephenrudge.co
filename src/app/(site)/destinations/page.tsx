import type { Metadata } from "next";
import Link from "next/link";
import { getDestinations } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Destinations",
  description: "A directory of countries and cities covered in the journal.",
};

export const revalidate = 60;

export default async function DestinationsPage() {
  const destinations = await getDestinations();
  const byRegion = destinations.reduce<Record<string, typeof destinations>>(
    (acc, destination) => {
      const list = acc[destination.region] ?? [];
      list.push(destination);
      acc[destination.region] = list;
      return acc;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-14 max-w-2xl">
        <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Destinations
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Countries and cities from the journal, with trip counts and links to
          each story.
        </p>
      </div>

      <div className="space-y-16">
        {Object.entries(byRegion).map(([region, places]) => (
          <section key={region}>
            <h2 className="mb-8 font-serif text-2xl text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {region}
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <div
                  key={place.country}
                  className="border-t border-zinc-200 pt-5 dark:border-zinc-800"
                >
                  <h3 className="text-xl text-zinc-900 dark:text-zinc-50">
                    {place.countryFlag} {place.country}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {place.postCount} {place.postCount === 1 ? "trip" : "trips"} ·{" "}
                    {place.cities.join(", ")}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {place.posts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-sm text-accent hover:underline"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
