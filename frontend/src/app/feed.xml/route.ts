import { getPosts } from "@/lib/api/posts";
import { SITE_URL } from "@/lib/site";
import { escapeXml } from "@/lib/xml";

const ITEMS = 20;

/** RSS 2.0 feed of the latest articles, for feed readers and email-digest services. */
export async function GET() {
  const { items } = await getPosts({ sort: "recent", page_size: ITEMS });
  const entries = items
    .map((post) => {
      const url = `${SITE_URL}/articles/${post.slug}`;
      const date = post.published_at ? new Date(post.published_at).toUTCString() : "";
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category.name)}</category>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>${date ? `\n      <pubDate>${date}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Faith Explorers</title>
    <link>${SITE_URL}</link>
    <description>Articles on faith, relationships, family and spiritual growth.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${entries}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
