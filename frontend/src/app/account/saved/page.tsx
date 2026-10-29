import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PagedPostGrid } from "@/components/posts/PagedPostGrid";
import { Hero } from "@/components/ui/Hero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { getMyBookmarks } from "@/lib/api/me";
import { loginHref } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { pageParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Saved articles",
  robots: { index: false },
};

const PAGE_SIZE = 6;

async function SavedArticles({ searchParams }: Pick<PageProps<"/account/saved">, "searchParams">) {
  if (!(await getCurrentUser())) redirect(loginHref("/account/saved"));
  const page = pageParam((await searchParams).page);
  const data = await getMyBookmarks(page, PAGE_SIZE);

  return (
    <PagedPostGrid
      data={data}
      basePath="/account/saved"
      empty="You haven't saved any articles yet. Tap “Save” on an article to keep it here."
    />
  );
}

export default function SavedPage({ searchParams }: PageProps<"/account/saved">) {
  return (
    <>
      <Hero image="/images/hoe-may-41.jpg" title="Saved articles" subtitle="Your reading list" />
      <SectionHeading title="Saved articles" subtitle="Most recently saved first" />
      <Suspense fallback={<CardGridSkeleton count={3} />}>
        <SavedArticles searchParams={searchParams} />
      </Suspense>
    </>
  );
}
