import type { ReactNode } from 'react'

interface QueryStateProps {
  isPending: boolean
  error: Error | null
  isEmpty?: boolean
  empty?: ReactNode
  children: ReactNode
}

/** Shared loading / error / empty handling for data-driven sections. */
export function QueryState({ isPending, error, isEmpty, empty, children }: QueryStateProps) {
  if (isPending) {
    return (
      <p className="query-state" role="status">
        Loading…
      </p>
    )
  }
  if (error) {
    return (
      <p className="query-state" role="alert">
        Sorry, we couldn't load this right now. Please refresh the page.
      </p>
    )
  }
  if (isEmpty) return <p className="query-state">{empty ?? 'Nothing here yet.'}</p>
  return <>{children}</>
}
