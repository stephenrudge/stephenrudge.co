export interface PortfolioItem {
  id: string;
  /** URL segment for /portfolio/[slug] */
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  imageAlt?: string;
  category?: string;
  year?: string;
  stack?: string[];
  /** Same-origin static demo path (no separate server required). */
  bundledDemoPath?: string;
  /** Live demo URL override (optional). */
  demoUrl?: string;
  /** Env var override for demo URL, e.g. NEXT_PUBLIC_HEARTH_EMBER_DEMO_URL */
  demoUrlEnv?: string;
  /** Optional external repo or case-study link */
  externalUrl?: string;
}

export function getPortfolioHref(item: PortfolioItem) {
  return `/portfolio/${item.slug}`;
}

export function getDemoUrl(item: PortfolioItem) {
  if (item.demoUrl) return item.demoUrl;
  if (item.demoUrlEnv) {
    const fromEnv = process.env[item.demoUrlEnv]?.trim();
    if (fromEnv) return fromEnv;
  }
  if (item.bundledDemoPath) return item.bundledDemoPath;
  return "";
}
