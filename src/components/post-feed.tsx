"use client";

import { useState } from "react";
import { PostCard } from "@/components/post-card";
import { FilterBar } from "@/components/filter-bar";
import { filterPosts, REGIONS, TRIP_TYPES } from "@/lib/filters";
import type { Post, Region, TripType } from "@/types";

export function PostFeed({
  posts,
  showFilters = true,
}: {
  posts: Post[];
  showFilters?: boolean;
}) {
  const [region, setRegion] = useState<Region | "All">("All");
  const [tripType, setTripType] = useState<TripType | "All">("All");

  const filtered = filterPosts(posts, region, tripType);

  return (
    <div className="space-y-10">
      {showFilters && (
        <FilterBar
          regions={REGIONS}
          tripTypes={TRIP_TYPES}
          selectedRegion={region}
          selectedTripType={tripType}
          onRegionChange={setRegion}
          onTripTypeChange={setTripType}
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-zinc-500">No stories match these filters yet.</p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
