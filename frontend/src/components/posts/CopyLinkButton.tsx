"use client";

import { useEffect, useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the address bar still has the link.
    }
  }

  return (
    <button type="button" className="share-link" onClick={copy}>
      <i className={copied ? "fa-solid fa-check" : "fa-solid fa-link"} aria-hidden="true"></i>
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}
