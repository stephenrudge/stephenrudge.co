"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/types";

const TravelMap = dynamic(
  () => import("./travel-map").then((mod) => mod.TravelMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900">
        Loading map…
      </div>
    ),
  },
);

export function MapSection({
  pins,
  title = "Places on the map",
  subtitle = "Click a pin to open the corresponding field notes.",
}: {
  pins: MapPin[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <TravelMap pins={pins} />
      </div>
    </section>
  );
}

export function PostMap({
  pin,
}: {
  pin: MapPin;
}) {
  return (
    <div className="my-10 overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <TravelMap
        pins={[pin]}
        center={[pin.lat, pin.lng]}
        zoom={6}
        className="h-[280px] w-full"
      />
    </div>
  );
}
