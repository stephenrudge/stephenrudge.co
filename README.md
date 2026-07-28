# stephenRudge.co

Personal travel blog — field notes, photography, and an interactive map of places visited.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + UI primitives
- **MDX** posts in `content/posts/`
- **Leaflet** maps
- **Framer Motion** + **next-themes**

## Getting started

Requires **Node.js 20+** (see `.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a post

Create a new `.mdx` file in `content/posts/` with frontmatter:

```yaml
title: "Your title"
date: "2026-01-15"
excerpt: "Short summary"
location: "City"
country: "Country"
countryFlag: "🇮🇸"
region: "Europe"
tripType: ["Road Trips", "Photography"]
tags: ["tag"]
coverImage: "https://images.unsplash.com/..."
lat: 64.1466
lng: -21.9426
featured: false
gallery:
  - src: "https://images.unsplash.com/..."
    alt: "Caption for photo"
```

## Admin portal

Write and publish stories at [http://localhost:3000/admin](http://localhost:3000/admin).

1. Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` + `ADMIN_SECRET`
2. Sign in at `/admin/login`
3. Create or edit stories — they save as MDX in `content/posts/` and appear on the public site

Default local password: `changeme`

**Hosting note:** the admin writes files to disk. That works for local/dev and hosts with a persistent filesystem. On serverless platforms (e.g. Vercel) published files won’t persist unless you add external storage or a database.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
