"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/posts", label: "Articles" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/users", label: "Users" },
];

function Tabs({ pathname }: { pathname: string | null }) {
  return (
    <nav className="admin-nav" aria-label="Admin">
      {TABS.map(({ href, label }) => {
        const active =
          pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNavFallback() {
  return <Tabs pathname={null} />;
}

export function AdminNav() {
  return <Tabs pathname={usePathname()} />;
}
