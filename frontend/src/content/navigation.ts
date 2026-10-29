export interface NavItem {
  href: string;
  label: string;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/categories", label: "Category" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/categories", label: "Category" },
  { href: "/articles", label: "Articles" },
  { href: "/contact", label: "Contact Us" },
  { href: "/become-an-author", label: "Write for us" },
  { href: "/feed.xml", label: "RSS feed" },
];

// Add the real profile URLs once the accounts exist; links without a URL are hidden.
export const SOCIAL_LINKS: { label: string; icon: string; href?: string }[] = [
  { label: "Facebook", icon: "fa-facebook-f" },
  { label: "Twitter", icon: "fa-twitter" },
  { label: "Instagram", icon: "fa-instagram" },
  { label: "LinkedIn", icon: "fa-linkedin" },
];
