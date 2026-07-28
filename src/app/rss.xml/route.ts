import { getPublishedPosts } from "@/lib/posts";
import { escapeXml, getSiteUrl } from "@/lib/site";

export const revalidate = 60;

export async function GET() {
  const site = getSiteUrl();
  const posts = await getPublishedPosts();
  const lastBuild = posts[0]?.date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      const description = escapeXml(post.excerpt || post.title);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Stephen Rudge — Journal</title>
    <link>${site}/blog</link>
    <description>Travel logs, field notes, and photography by Stephen Rudge.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
