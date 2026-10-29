/** Placeholders shown while streamed sections load. */

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="editorcards container flex" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="edcard skeleton" />
      ))}
    </section>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}
