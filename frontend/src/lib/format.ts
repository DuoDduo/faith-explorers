import { API_URL } from '../api/client'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(iso: string | null): string {
  return iso ? dateFormat.format(new Date(iso)) : ''
}

/** API image paths are relative (/media/...); point them at the API in production. */
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith('/media/') ? `${API_URL}${path}` : path
}
