"use client";

/**
 * Embed Sanity Studio at /studio.
 * Content editing + inline photo uploads happen here (no Vercel rebuild required).
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
