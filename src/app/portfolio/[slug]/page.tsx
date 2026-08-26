import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioProjectView } from "@/components/portfolio-project-view";
import { getPortfolioItem, getPortfolioItems } from "@/data/portfolio";
import { isBundledDemoAvailable, isDemoReachable } from "@/lib/portfolio-demo";
import { getDemoUrl } from "@/types/portfolio";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getPortfolioItems().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getPortfolioItem(slug);
  if (!item) return { title: "Portfolio" };

  return {
    title: item.title,
    description: item.description,
  };
}

export default async function PortfolioProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getPortfolioItem(slug);
  if (!item) notFound();

  const demoUrl = getDemoUrl(item);
  let demoReachable = false;
  if (demoUrl) {
    if (item.bundledDemoPath && demoUrl === item.bundledDemoPath) {
      demoReachable = isBundledDemoAvailable(item.bundledDemoPath);
    } else {
      demoReachable = await isDemoReachable(demoUrl);
    }
  }

  return (
    <PortfolioProjectView
      item={item}
      demoUrl={demoUrl}
      demoReachable={demoReachable}
    />
  );
}
