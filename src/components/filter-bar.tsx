"use client";

import { cn } from "@/lib/utils";
import type { Region, TripType } from "@/types";

interface FilterBarProps {
  regions: (Region | "All")[];
  tripTypes: (TripType | "All")[];
  selectedRegion: Region | "All";
  selectedTripType: TripType | "All";
  onRegionChange: (region: Region | "All") => void;
  onTripTypeChange: (tripType: TripType | "All") => void;
}

export function FilterBar({
  regions,
  tripTypes,
  selectedRegion,
  selectedTripType,
  onRegionChange,
  onTripTypeChange,
}: FilterBarProps) {
  return (
    <div className="space-y-5">
      <FilterGroup
        label="Region"
        options={regions}
        selected={selectedRegion}
        onChange={onRegionChange}
      />
      <FilterGroup
        label="Trip type"
        options={tripTypes}
        selected={selectedTripType}
        onChange={onTripTypeChange}
      />
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  selected: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "border px-3 py-1.5 text-sm transition-colors",
              selected === option
                ? "border-accent bg-accent text-white"
                : "border-zinc-300 text-zinc-700 hover:border-accent/60 hover:text-accent dark:border-zinc-700 dark:text-zinc-300",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
