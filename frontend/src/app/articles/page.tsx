import type { Metadata } from "next";
import { Suspense } from "react";
import { LatestComments } from "@/components/comments/LatestComments";
import { SearchForm } from "@/components/forms/SearchForm";
import { PaginatedPosts } from "@/components/posts/PaginatedPosts";
import { PopularPosts } from "@/components/posts/PopularPosts";
import { RecentPosts } from "@/components/posts/RecentPosts";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/ui/Hero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SidebarPanel } from "@/components/ui/SidebarPanel";
import { CardGridSkeleton, ListSkeleton } from "@/components/ui/Skeletons";
import { firstParam, pageParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse and search every Faith Explorers article.",
};

const PAGE_SIZE = 6;

async function ArticleResults({ searchParams }: Pick<PageProps<"/articles">, "searchParams">) {
  const params = await searchParams;
  const q = firstParam(params.q)?.trim() || undefined;
  const tag = firstParam(params.tag) || undefined;
  const page = pageParam(params.page);

  const subtitle = tag ? `Tagged #${tag}` : q ? `Results for "${q}"` : "Curated just for you";

  return (
    <>
      <SectionHeading
        id="all-articles"
        title="All Articles"
        subtitle={subtitle}
        aside={<SearchForm defaultValue={q} />}
      />
      <PaginatedPosts
        query={{ q, tag, page, page_size: PAGE_SIZE }}
        basePath="/articles"
        keep={{ q, tag }}
        empty={q ? `No articles match "${q}".` : "No articles yet."}
      />
    </>
  );
}

export default function ArticlesPage({ searchParams }: PageProps<"/articles">) {
  return (
    <>
      <Hero image="/images/hoe-may-41.jpg" />

      <Suspense
        fallback={
          <>
            <SectionHeading title="All Articles" subtitle="Curated just for you" />
            <CardGridSkeleton count={PAGE_SIZE} />
          </>
        }
      >
        <ArticleResults searchParams={searchParams} />
      </Suspense>

      <section className="recentpostsec container flex">
        <div className="recentposts" data-aos="fade-up">
          <SectionHeading
            title="Recent posts"
            subtitle="Don't miss the latest trends"
            contained={false}
          />
          <Suspense fallback={<ListSkeleton />}>
            <RecentPosts />
          </Suspense>
        </div>

        <div className="postslider">
          <SidebarPanel title="Popular Posts">
            <Suspense fallback={<ListSkeleton rows={5} />}>
              <PopularPosts />
            </Suspense>
          </SidebarPanel>
          <SidebarPanel title="Latest Comments">
            <Suspense fallback={<ListSkeleton />}>
              <LatestComments />
            </Suspense>
          </SidebarPanel>
        </div>
      </section>

      <Faq />
    </>
  );
}
