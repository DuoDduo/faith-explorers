import Image from "next/image";
import Link from "next/link";
import { DEFAULT_COVER } from "@/content/site";
import { pluralize } from "@/lib/format";
import type { Category } from "@/types/api";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="category-card" data-aos="fade-up">
      <Image
        src={category.cover_url ?? DEFAULT_COVER}
        alt=""
        width={420}
        height={220}
        sizes="(max-width: 600px) 100vw, 33vw"
      />
      <div>
        <h3>{category.name}</h3>
        <p>{pluralize(category.post_count, "article")}</p>
      </div>
    </Link>
  );
}
