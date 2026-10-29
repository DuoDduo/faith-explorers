import AOS from 'aos'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    AOS.init({ duration: 800, offset: 150, once: true })
  }, [])

  // Pick up elements rendered by the new page (and by data arriving later).
  useEffect(() => {
    AOS.refreshHard()
  }, [pathname])

  return (
    <>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
