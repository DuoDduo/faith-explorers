import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaginatedPosts } from "@/components/posts/PaginatedPosts";
import { Avatar } from "@/components/ui/Avatar";
import { Hero } from "@/components/ui/Hero";
import { CardGridSkeleton } from "@/components/ui/Skeletons";
import { DEFAULT_COVER } from "@/content/site";
import { getAuthor } from "@/lib/api/authors";
import { pluralize } from "@/lib/format";
import { pageParam } from "@/lib/url";

type Props = PageProps<"/authors/[id]">;

const PAGE_SIZE = 6;

/** Author ids in URLs are positive integers; anything else is a 404. */
function authorId(raw: string): number | null {
  return /^[1-9]\d*$/.test(raw) ? Number(raw) : null;
}

async function loadAuthor(params: Props["params"]) {
  const id = authorId((await params).id);
  return id === null ? null : getAuthor(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await loadAuthor(params);
  if (!author) return { title: "Author not found" };
  return {
    title: author.name,
    description: author.bio ?? `Articles by ${author.name} on Faith Explorers.`,
    alternates: { canonical: `/authors/${author.id}` },
  };
}

async function AuthorContent({ params, searchParams }: Props) {
  const author = await loadAuthor(params);
  if (!author) notFound();
  const page = pageParam((await searchParams).page);

  return (
    <>
      <Hero
        image={DEFAULT_COVER}
        title={author.name}
        subtitle={pluralize(author.post_count, "article")}
      />
      {author.bio && (
        <div className="container">
          <aside className="about-author author-profile" aria-label="About the author">
            <Avatar src={author.avatar_url} name={author.name} size={80} />
            <p>{author.bio}</p>
          </aside>
        </div>
      )}
      <PaginatedPosts
        query={{ author: author.id, page, page_size: PAGE_SIZE }}
        basePath={`/authors/${author.id}`}
        empty="No published articles yet."
      />
    </>
  );
}

export default function AuthorPage(props: Props) {
  return (
    <Suspense
      fallback={
        <>
          <Hero image={DEFAULT_COVER} title=" " subtitle=" " />
          <CardGridSkeleton count={PAGE_SIZE} />
        </>
      }
    >
      <AuthorContent {...props} />
    </Suspense>
  );
}
