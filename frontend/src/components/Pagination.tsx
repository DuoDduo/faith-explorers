interface PaginationProps {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null
  return (
    <nav className="pagination showmorepost flex" aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        <span className="sr-only">Previous page</span>
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
          className={n === page ? 'active' : undefined}
        >
          {n}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages}>
        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        <span className="sr-only">Next page</span>
      </button>
    </nav>
  )
}
