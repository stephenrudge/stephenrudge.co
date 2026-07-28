"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { REGIONS, TRIP_TYPES } from "@/lib/filters";
import { slugify } from "@/lib/slug";
import type { Post, Region, TripType } from "@/types";

const regions = REGIONS.filter((region): region is Region => region !== "All");
const tripTypes = TRIP_TYPES.filter(
  (type): type is TripType => type !== "All",
);

export type PostFormValues = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  location: string;
  country: string;
  countryFlag: string;
  region: Region;
  tripType: TripType[];
  tags: string;
  coverImage: string;
  lat: string;
  lng: string;
  featured: boolean;
  content: string;
};

const emptyValues: PostFormValues = {
  title: "",
  slug: "",
  date: new Date().toISOString().slice(0, 10),
  excerpt: "",
  location: "",
  country: "",
  countryFlag: "",
  region: "Europe",
  tripType: ["Solo Travel"],
  tags: "",
  coverImage: "",
  lat: "",
  lng: "",
  featured: false,
  content: "",
};

function postToValues(post: Post): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    date: post.date,
    excerpt: post.excerpt,
    location: post.location,
    country: post.country,
    countryFlag: post.countryFlag,
    region: post.region,
    tripType: post.tripType,
    tags: post.tags.join(", "),
    coverImage: post.coverImage,
    lat: String(post.lat),
    lng: String(post.lng),
    featured: Boolean(post.featured),
    content: post.content,
  };
}

export function PostEditor({
  mode,
  initialPost,
}: {
  mode: "create" | "edit";
  initialPost?: Post;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>(
    initialPost ? postToValues(initialPost) : emptyValues,
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setValues((current) => ({
        ...current,
        slug: slugify(current.title),
      }));
    }
  }, [values.title, slugTouched]);

  function update<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleTripType(type: TripType) {
    setValues((current) => {
      const exists = current.tripType.includes(type);
      return {
        ...current,
        tripType: exists
          ? current.tripType.filter((item) => item !== type)
          : [...current.tripType, type],
      };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...values,
      lat: Number(values.lat),
      lng: Number(values.lng),
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const response = await fetch(
      mode === "create"
        ? "/api/admin/posts"
        : `/api/admin/posts/${initialPost?.slug}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = (await response.json().catch(() => null)) as {
      error?: string;
      post?: Post;
      message?: string;
      via?: "local" | "github";
    } | null;

    setSaving(false);

    if (!response.ok || !data?.post) {
      setError(data?.error || "Could not save story.");
      return;
    }

    if (data.via === "github" && data.message) {
      window.alert(data.message);
    }

    router.push("/admin");
    router.refresh();
  }

  async function onDelete() {
    if (!initialPost) return;
    if (!window.confirm(`Delete “${initialPost.title}”? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError("");
    const response = await fetch(`/api/admin/posts/${initialPost.slug}`, {
      method: "DELETE",
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
      via?: "local" | "github";
    } | null;
    setDeleting(false);

    if (!response.ok) {
      setError(data?.error || "Could not delete story.");
      return;
    }

    if (data?.via === "github" && data.message) {
      window.alert(data.message);
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-50">
            {mode === "create" ? "New story" : "Edit story"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Write in Markdown. On Vercel, saves commit to GitHub and redeploy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" && initialPost && (
            <Button asChild variant="outline" type="button">
              <Link href={`/blog/${initialPost.slug}`} target="_blank">
                View live
              </Link>
            </Button>
          )}
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              disabled={deleting}
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2">
          <input
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Slug">
          <input
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              update("slug", slugify(event.target.value));
            }}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={values.date}
            onChange={(event) => update("date", event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Excerpt" className="sm:col-span-2">
          <textarea
            value={values.excerpt}
            onChange={(event) => update("excerpt", event.target.value)}
            className={`${inputClass} min-h-20`}
            required
          />
        </Field>
        <Field label="Cover image URL" className="sm:col-span-2">
          <input
            value={values.coverImage}
            onChange={(event) => update("coverImage", event.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={inputClass}
            required
          />
        </Field>
        <Field label="Location / city">
          <input
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Country">
          <input
            value={values.country}
            onChange={(event) => update("country", event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Country flag emoji">
          <input
            value={values.countryFlag}
            onChange={(event) => update("countryFlag", event.target.value)}
            placeholder="🇮🇸"
            className={inputClass}
          />
        </Field>
        <Field label="Region">
          <select
            value={values.region}
            onChange={(event) =>
              update("region", event.target.value as Region)
            }
            className={inputClass}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Latitude">
          <input
            value={values.lat}
            onChange={(event) => update("lat", event.target.value)}
            inputMode="decimal"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Longitude">
          <input
            value={values.lng}
            onChange={(event) => update("lng", event.target.value)}
            inputMode="decimal"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Tags (comma separated)" className="sm:col-span-2">
          <input
            value={values.tags}
            onChange={(event) => update("tags", event.target.value)}
            placeholder="iceland, waterfalls, road-trip"
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Trip type
          </p>
          <div className="flex flex-wrap gap-2">
            {tripTypes.map((type) => {
              const active = values.tripType.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleTripType(type)}
                  className={`border px-3 py-1.5 text-sm ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) => update("featured", event.target.checked)}
          />
          Feature this story on the homepage
        </label>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <TabButton active={tab === "write"} onClick={() => setTab("write")}>
            Write
          </TabButton>
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Preview
          </TabButton>
        </div>
        {tab === "write" ? (
          <textarea
            value={values.content}
            onChange={(event) => update("content", event.target.value)}
            placeholder={"## Opening\n\nTell the story…\n\n> A memorable line"}
            className="min-h-[420px] w-full resize-y bg-transparent px-4 py-4 font-mono text-sm outline-none"
            required
          />
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none px-4 py-4">
            {values.content ? (
              <ReactMarkdown>{values.content}</ReactMarkdown>
            ) : (
              <p className="text-zinc-500">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </section>
    </form>
  );
}

const inputClass =
  "w-full border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-950";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-sm ${
        active
          ? "border-b-2 border-accent text-accent"
          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
