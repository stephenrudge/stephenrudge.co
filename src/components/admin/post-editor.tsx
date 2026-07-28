"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { InlineImageUpload } from "@/components/admin/inline-image-upload";
import { MDXImage } from "@/components/mdx/mdx-image";
import { REGIONS, TRIP_TYPES } from "@/lib/filters";
import { slugify } from "@/lib/slug";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/utils";
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
  draft: boolean;
  scheduledFor: string;
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
  draft: true,
  scheduledFor: "",
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
    countryFlag: post.countryFlag || "",
    region: post.region,
    tripType: post.tripType,
    tags: post.tags.join(", "),
    coverImage: post.coverImage,
    lat: String(post.lat),
    lng: String(post.lng),
    featured: Boolean(post.featured),
    draft: Boolean(post.draft),
    scheduledFor: toDatetimeLocalValue(post.scheduledFor),
    content: post.content,
  };
}

type SaveMode = "draft" | "schedule" | "publish";

export function PostEditor({
  mode,
  initialPost,
}: {
  mode: "create" | "edit";
  initialPost?: Post;
}) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [values, setValues] = useState<PostFormValues>(
    initialPost ? postToValues(initialPost) : emptyValues,
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<SaveMode | null>(null);
  const [deleting, setDeleting] = useState(false);

  const statusLabel = useMemo(() => {
    if (values.draft) return "Currently a draft — hidden from the public site.";
    if (values.scheduledFor) {
      const when = fromDatetimeLocalValue(values.scheduledFor);
      if (when && new Date(when).getTime() > Date.now()) {
        return "Scheduled — will go live at the time below.";
      }
    }
    return "Published — visible on the public site.";
  }, [values.draft, values.scheduledFor]);

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

  function insertMarkdownIntoContent(snippet: string) {
    const el = contentRef.current;
    const current = values.content;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const before = current.slice(0, start);
    const after = current.slice(end);

    let prefix = "";
    if (before.length > 0 && !before.endsWith("\n\n")) {
      prefix = before.endsWith("\n") ? "\n" : "\n\n";
    }

    const block = `${prefix}${snippet}\n\n`;
    update("content", `${before}${block}${after}`);
    setTab("write");

    const cursor = before.length + block.length;
    requestAnimationFrame(() => {
      const textarea = contentRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
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

  async function saveStory(saveMode: SaveMode) {
    setSaving(saveMode);
    setError("");

    if (!values.title.trim()) {
      setSaving(null);
      setError("Add a title before saving.");
      return;
    }

    if (saveMode !== "draft" && !values.coverImage.trim()) {
      setSaving(null);
      setError(
        "Add a cover image upload or paste an image URL before publishing.",
      );
      return;
    }

    let scheduledFor: string | undefined;
    if (saveMode === "schedule") {
      scheduledFor = fromDatetimeLocalValue(values.scheduledFor);
      if (!scheduledFor) {
        setSaving(null);
        setError("Pick a future date and time to schedule this story.");
        return;
      }
      if (new Date(scheduledFor).getTime() <= Date.now() + 60_000) {
        setSaving(null);
        setError("Schedule time must be at least one minute in the future.");
        return;
      }
    }

    const payload = {
      ...values,
      countryFlag: "",
      draft: saveMode === "draft",
      featured: saveMode === "draft" ? false : values.featured,
      scheduledFor: saveMode === "schedule" ? scheduledFor : undefined,
      lat: values.lat.trim() === "" ? "" : Number(values.lat),
      lng: values.lng.trim() === "" ? "" : Number(values.lng),
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
      via?: "supabase" | "local" | "github";
    } | null;

    setSaving(null);

    if (!response.ok || !data?.post) {
      setError(data?.error || "Could not save story.");
      return;
    }

    if (data.message) {
      window.alert(data.message);
    }

    router.push("/admin");
    router.refresh();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await saveStory("publish");
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
      via?: "supabase" | "local" | "github";
    } | null;
    setDeleting(false);

    if (!response.ok) {
      setError(data?.error || "Could not delete story.");
      return;
    }

    if (data?.message) {
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
            {statusLabel} Saves to Supabase and goes live immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" &&
            initialPost &&
            !initialPost.draft &&
            !(
              initialPost.scheduledFor &&
              new Date(initialPost.scheduledFor).getTime() > Date.now()
            ) && (
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
              disabled={deleting || Boolean(saving)}
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(saving) || deleting}
            onClick={() => void saveStory("draft")}
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(saving) || deleting}
            onClick={() => void saveStory("schedule")}
          >
            {saving === "schedule" ? "Scheduling…" : "Schedule"}
          </Button>
          <Button type="submit" disabled={Boolean(saving) || deleting}>
            {saving === "publish"
              ? "Publishing…"
              : values.draft || values.scheduledFor
                ? "Publish now"
                : "Update"}
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
        <Field label="Schedule publish (optional)" className="sm:col-span-2">
          <input
            type="datetime-local"
            value={values.scheduledFor}
            onChange={(event) => update("scheduledFor", event.target.value)}
            className={inputClass}
          />
          <span className="mt-1.5 block text-xs text-zinc-500">
            Set a future time, then click <strong>Schedule</strong>. The story
            stays hidden until then (checked about every minute).
          </span>
        </Field>
        <Field label="Excerpt (optional)" className="sm:col-span-2">
          <textarea
            value={values.excerpt}
            onChange={(event) => update("excerpt", event.target.value)}
            className={`${inputClass} min-h-20`}
          />
        </Field>
        <CoverImageField
          value={values.coverImage}
          onChange={(path) => update("coverImage", path)}
        />
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
        <Field label="Latitude (optional)">
          <input
            value={values.lat}
            onChange={(event) => update("lat", event.target.value)}
            inputMode="decimal"
            className={inputClass}
          />
        </Field>
        <Field label="Longitude (optional)">
          <input
            value={values.lng}
            onChange={(event) => update("lng", event.target.value)}
            inputMode="decimal"
            className={inputClass}
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
          <>
            <InlineImageUpload onInsert={insertMarkdownIntoContent} />
            <textarea
              ref={contentRef}
              value={values.content}
              onChange={(event) => update("content", event.target.value)}
              placeholder={
                "## Opening\n\nTell the story…\n\n![Trail view](/uploads/photo.jpg)\n\n> A memorable line"
              }
              className="min-h-[420px] w-full resize-y bg-transparent px-4 py-4 font-mono text-sm outline-none"
            />
          </>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none px-4 py-4">
            {values.content ? (
              <ReactMarkdown
                components={{
                  img: ({ src, alt, title }) => (
                    <MDXImage
                      src={typeof src === "string" ? src : undefined}
                      alt={alt || ""}
                      title={title}
                    />
                  ),
                }}
              >
                {values.content}
              </ReactMarkdown>
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
