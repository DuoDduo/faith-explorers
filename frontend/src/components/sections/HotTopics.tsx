import Image from "next/image";
import Link from "next/link";
import { HotTopicsCarousel } from "@/components/sections/HotTopicsCarousel";
import { DEFAULT_COVER } from "@/content/site";
import { getCategories } from "@/lib/api/categories";
import { pluralize } from "@/lib/format";

/** Horizontally scrolling category cards on the home page. */
export async function HotTopics() {
  const categories = (await getCategories()).filter((c) => c.post_count > 0);

  return (
    <HotTopicsCarousel>
      {categories.map((c) => (
        <div className="hcard" key={c.slug}>
          <Link href={`/categories/${c.slug}`}>
            <Image src={c.cover_url ?? DEFAULT_COVER} alt="" width={200} height={300} />
            <div className="hdetails">
              <div className="hdetail">
                <h3>{c.name}</h3>
                <p>{pluralize(c.post_count, "Article")}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </HotTopicsCarousel>
  );
}
