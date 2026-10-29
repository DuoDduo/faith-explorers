"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";
import { MAIN_NAV } from "@/content/navigation";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

interface NavListProps {
  /** null while the current URL isn't known yet (static shell): no link is highlighted. */
  pathname: string | null;
  onNavigate: () => void;
  account: ReactNode;
}

function NavList({ pathname, onNavigate, account }: NavListProps) {
  return (
    <ul className="flex">
      {MAIN_NAV.map(({ href, label }) => {
        const active = pathname !== null && isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={active ? "liactive" : undefined}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        );
      })}
      <li onClick={onNavigate}>{account}</li>
    </ul>
  );
}

function CurrentNavList(props: Omit<NavListProps, "pathname">) {
  return <NavList pathname={usePathname()} {...props} />;
}

/** `account` is the server-rendered sign-in/account link (it reads the session cookie). */
export function Header({ account }: { account: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="header" className={scrolled ? "scrolled" : undefined}>
      <nav className="flex container1" aria-label="Main">
        <Link href="/" className="logo flex" onClick={closeMenu}>
          <div className="logoimg">
            <Image src="/images/faith.png" alt="" width={40} height={49} loading="eager" />
          </div>
          {/* The logo image is the "F"; screen readers get the whole name instead. */}
          <h3 className="logo-text" aria-hidden="true">
            aith Explorers
          </h3>
          <span className="sr-only">Faith Explorers</span>
        </Link>

        <div className={`navlist flex${menuOpen ? " open" : ""}`} id="main-menu">
          <Suspense fallback={<NavList pathname={null} onNavigate={closeMenu} account={account} />}>
            <CurrentNavList onNavigate={closeMenu} account={account} />
          </Suspense>
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
  );
}
