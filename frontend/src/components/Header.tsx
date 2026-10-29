import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/categories', label: 'Category' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header id="header" className={scrolled ? 'scrolled' : undefined}>
      <nav className="flex container1" aria-label="Main">
        <Link
          to="/"
          className="logo flex"
          aria-label="Faith Explorers home"
          onClick={() => setMenuOpen(false)}
        >
          <div className="logoimg">
            <img src="/images/faith.png" alt="" />
          </div>
          <h3 style={{ color: '#53179a' }}>aith Explorers</h3>
        </Link>
        <div className={`navlist flex${menuOpen ? ' open' : ''}`} id="main-menu">
          <ul className="flex">
            {NAV.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => (isActive ? 'liactive' : undefined)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <input
          type="checkbox"
          id="checkbox"
          checked={menuOpen}
          onChange={(e) => setMenuOpen(e.target.checked)}
          aria-controls="main-menu"
          aria-label="Toggle menu"
        />
        <label htmlFor="checkbox" className="toggle">
          <div className="bars" id="bar1"></div>
          <div className="bars" id="bar2"></div>
          <div className="bars" id="bar3"></div>
        </label>
      </nav>
    </header>
  )
}
