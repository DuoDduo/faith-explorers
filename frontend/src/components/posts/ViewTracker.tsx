"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions/views";

/** Counts one view when an article is opened in the browser (crawlers don't run it). */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    void recordView(slug);
  }, [slug]);
  return null;
}
