export interface ShareLink {
  network: string;
  label: string;
  icon: string;
  href: string;
}

/** Plain share URLs: no third-party scripts or tracking on our pages. */
export function shareLinks(url: string, title: string): ShareLink[] {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  return [
    {
      network: "whatsapp",
      label: "WhatsApp",
      icon: "fa-brands fa-whatsapp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      network: "facebook",
      label: "Facebook",
      icon: "fa-brands fa-facebook-f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      network: "x",
      label: "X",
      icon: "fa-brands fa-x-twitter",
      href: `https://x.com/intent/post?url=${u}&text=${text}`,
    },
    {
      network: "linkedin",
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      network: "email",
      label: "Email",
      icon: "fa-solid fa-envelope",
      href: `mailto:?subject=${text}&body=${u}`,
    },
  ];
}
