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

### Production (Vercel)

Vercel’s filesystem is **read-only**, so admin create/edit/delete uses the **GitHub API** and commits to your repo. Vercel then redeploys automatically.

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|----------|--------|
| `ADMIN_PASSWORD` | your admin password |
| `ADMIN_SECRET` | long random string |
| `GITHUB_TOKEN` | fine-grained PAT with **Contents: Read and write** on this repo |
| `GITHUB_REPO` | `stephenrudge/stephenrudge.co` |
| `GITHUB_BRANCH` | `main` |

Create the token at [GitHub → Settings → Developer settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens). After changing env vars, **redeploy** the project.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
