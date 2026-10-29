import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaginatedPosts } from "@/components/posts/PaginatedPosts";
import { Hero } from "@/components/ui/Hero";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { DEFAULT_COVER } from "@/content/site";
import { getCategory } from "@/lib/api/categories";
import { pluralize } from "@/lib/format";
import { pageParam } from "@/lib/url";

type Props = PageProps<"/categories/[slug]">;

const PAGE_SIZE = 6;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description ?? `Faith Explorers articles about ${category.name}.`,
  };
}

async function CategoryContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const page = pageParam((await searchParams).page);

  return (
    <>
      <Hero
        image={category.cover_url ?? DEFAULT_COVER}
        title={category.name}
        subtitle={category.description ?? pluralize(category.post_count, "article")}
      />
      <div className="container bigtitle">
        <p>
          <Link href="/categories" className="back-link">
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> All categories
          </Link>
        </p>
      </div>
      <PaginatedPosts
        query={{ category: slug, page, page_size: PAGE_SIZE }}
        basePath={`/categories/${slug}`}
        empty="No articles in this category yet."
      />
    </>
  );
}

export default function CategoryPage(props: Props) {
  return (
    <Suspense
      fallback={
        <>
          <Hero image={DEFAULT_COVER} title=" " subtitle=" " />
          <CardGridSkeleton count={PAGE_SIZE} />
        </>
      }
    >
      <CategoryContent {...props} />
    </Suspense>
  );
}
