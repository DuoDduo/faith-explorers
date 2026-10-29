import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/api/categories";
import { getPosts } from "@/lib/api/posts";
import { SITE_URL } from "@/lib/site";
import type { PostSummary } from "@/types/api";

const STATIC_PAGES = ["", "/articles", "/categories", "/about", "/contact", "/become-an-author"];
const PAGE_SIZE = 50; // the API's maximum

async function allPublishedPosts(): Promise<PostSummary[]> {
  const first = await getPosts({ page: 1, page_size: PAGE_SIZE });
  const rest = await Promise.all(
    Array.from({ length: first.pages - 1 }, (_, i) =>
      getPosts({ page: i + 2, page_size: PAGE_SIZE }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([allPublishedPosts(), getCategories()]);
  return [
    ...STATIC_PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...categories
      .filter((c) => c.post_count > 0)
      .map((c) => ({ url: `${SITE_URL}/categories/${c.slug}` })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/articles/${post.slug}`,
      lastModified: post.published_at ?? undefined,
    })),
  ];
}
