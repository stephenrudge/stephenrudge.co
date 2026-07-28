import type { Metadata } from "next";
import { Camera, Laptop, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "About & Gear",
  description:
    "About Stephen Rudge — the journey, the stack behind this site, and travel photography gear.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        About & Gear
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        I write travel logs, field notes, and photography essays from the road.
        This site is a living atlas of places I&apos;ve been — mapped, tagged,
        and told as straight as possible.
      </p>

      <section className="mt-16">
        <div className="mb-4 flex items-center gap-2 text-accent">
          <Map className="h-5 w-5" />
          <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
            The journey
          </h2>
        </div>
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          Most trips start with a question rather than an itinerary: what does
          this place feel like at dawn? What happens if you take the slower
          road? The journal is where those answers land — sometimes as guides,
          sometimes as photographs, often as notes I wish I had before I left.
        </p>
      </section>

      <section className="mt-14">
        <div className="mb-4 flex items-center gap-2 text-accent">
          <Laptop className="h-5 w-5" />
          <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">
            Site stack
          </h2>
        </div>
        <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
          <li>Next.js App Router + TypeScript</li>
          <li>Tailwind CSS + lightweight UI primitives</li>
          <li>Local MDX posts with frontmatter (no heavy CMS)</li>
          <li>Leaflet for destination maps</li>
          <li>Framer Motion for subtle motion</li>
          <li>next-themes for light / dark mode</li>
        </ul>
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
              Full-frame mirrorless body, 24–70mm for most walking days, 16–35mm
              for landscapes, and a compact prime for evenings when weight
              matters.
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
  );
}
