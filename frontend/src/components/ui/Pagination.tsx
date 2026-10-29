import Link from "next/link";

interface PaginationProps {
  page: number;
  pages: number;
  /** Builds the URL for a page number, keeping any other filters. */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, pages, hrefFor }: PaginationProps) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav className="pagination showmorepost flex" aria-label="Pagination">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} scroll={false} aria-label="Previous page">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </Link>
      )}
      {numbers.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          scroll={false}
          aria-current={n === page ? "page" : undefined}
          className={n === page ? "active" : undefined}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={hrefFor(page + 1)} scroll={false} aria-label="Next page">
          <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </Link>
      )}
    </nav>
  );
}
