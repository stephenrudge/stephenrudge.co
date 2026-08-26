import type { PortfolioItem } from "@/types/portfolio";

/**
 * Portfolio pieces — add entries here. Each box links to /portfolio/[slug]
 * with an embedded live demo when demoUrl or demoUrlEnv is set.
 */
export const portfolioItems: PortfolioItem[] = [
  {
    id: "hearth-ember-co",
    slug: "hearth-ember-co",
    title: "Hearth & Ember Co.",
    description:
      "Artisan bakery and coffee roastery site — shop, workshops, journal, and cart.",
    longDescription:
      "A full storefront experience for a Franklin, Tennessee sourdough bakery and small-batch roastery. Built as a single-page Next.js app with product shop, workshop booking flow, journal, dark mode, and a persistent cart drawer.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=900&fit=crop",
    imageAlt: "Baker shaping sourdough beside a wood-fired oven",
    category: "Web app",
    year: "2025",
    stack: ["Next.js", "React", "Tailwind CSS", "Framer Motion", "Zustand"],
    bundledDemoPath: "/demos/hearth-ember-co/index.html",
    demoUrlEnv: "NEXT_PUBLIC_HEARTH_EMBER_DEMO_URL",
  },
];

export function getPortfolioItems() {
  return portfolioItems;
}

export function getPortfolioItem(slug: string) {
  return portfolioItems.find((item) => item.slug === slug);
}
