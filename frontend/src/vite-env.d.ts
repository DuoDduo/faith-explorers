/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin for production builds, e.g. https://api.faithexplorers.org (empty = same origin). */
  readonly VITE_API_URL?: string
}
