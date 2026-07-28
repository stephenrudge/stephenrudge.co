import type { Metadata } from "next";
import Image from "next/image";
import { Camera, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Stephen Rudge — scuba diver, traveler, and reader exploring the world one road and reef at a time.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="relative isolate min-h-[56vh] w-full overflow-hidden sm:min-h-[64vh]">
        <Image
          src="/images/about-stephen.jpg"
          alt="Stephen Rudge sitting on an open road lined with autumn trees"
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
          <p className="font-serif text-4xl tracking-tight text-white sm:text-6xl">
            Stephen Rudge
          </p>
          <p className="mt-3 max-w-xl text-base text-zinc-200 sm:text-lg">
            Scuba diver, traveler, and lifelong explorer.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <section>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            About me
          </h1>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p>
              I&apos;m Stephen Rudge — a scuba diver and traveler who loves
              exploring new places and reading along the way. The road, the
              reef, and a good book are the three constants I keep coming back
              to.
            </p>
            <p>
              This site is where those trips land: travel logs, field notes, and
              photographs from the places I&apos;ve been, told as straight as
              possible.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <Compass className="h-5 w-5" />
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
              The journey
            </h2>
          </div>
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            Most trips start with a question rather than an itinerary: what does
            this place feel like at dawn? What happens if you take the slower
            road? Underwater, the same curiosity applies — drop below the
            surface and the world rearranges itself. The journal is where those
            answers land.
          </p>
        </section>

        <section className="mt-14">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <Camera className="h-5 w-5" />
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
              Travel & photography kit
            </h2>
          </div>
          <div className="space-y-6 text-zinc-600 dark:text-zinc-400">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Camera
              </h3>
              <p className="mt-1">
                Full-frame mirrorless body, 24–70mm for most walking days,
                16–35mm for landscapes, and a compact prime for evenings when
                weight matters.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Everyday carry
              </h3>
              <p className="mt-1">
                Weatherproof shell, compact tripod, spare batteries, ND filter,
                offline maps, and a notebook that survives rain better than a
                phone.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Computing
              </h3>
              <p className="mt-1">
                Lightweight laptop for culling and writing on the road; external
                SSD for backups; phone hotspot when cafés fail.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
