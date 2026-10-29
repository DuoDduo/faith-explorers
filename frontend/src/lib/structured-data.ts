import { SITE_URL } from "@/lib/site";
import type { PostDetail } from "@/types/api";

const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** schema.org Article data, so search engines can show rich results for an article. */
export function articleJsonLd(post: PostDetail, defaultImage: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [absolute(post.cover_url ?? defaultImage)],
    datePublished: post.published_at ?? undefined,
    mainEntityOfPage: `${SITE_URL}/articles/${post.slug}`,
    articleSection: post.category.name,
    keywords: post.tags.map((tag) => tag.name).join(", ") || undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `${SITE_URL}/authors/${post.author.id}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Faith Explorers",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/faith.png` },
    },
  };
}

/** Serialize for a <script type="application/ld+json">, escaping "<" so content can't close the tag. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
