import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

// Every page except Home loads on demand, so the first visit only downloads what it shows.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'articles',
        lazy: async () => ({ Component: (await import('./pages/ArticlesPage')).ArticlesPage }),
      },
      {
        path: 'articles/:slug',
        lazy: async () => ({ Component: (await import('./pages/ArticlePage')).ArticlePage }),
      },
      {
        path: 'categories',
        lazy: async () => ({ Component: (await import('./pages/CategoriesPage')).CategoriesPage }),
      },
      {
        path: 'categories/:slug',
        lazy: async () => ({ Component: (await import('./pages/CategoryPage')).CategoryPage }),
      },
      {
        path: 'about',
        lazy: async () => ({ Component: (await import('./pages/AboutPage')).AboutPage }),
      },
      {
        path: 'contact',
        lazy: async () => ({ Component: (await import('./pages/ContactPage')).ContactPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
