"use client";

import { Hero } from "@/components/ui/Hero";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <>
      <Hero
        image="/images/hoe-may.jpg"
        title="Something went wrong"
        subtitle="We couldn't load this page. Please try again in a moment."
      />
      <div className="showmorepost flex">
        <button type="button" className="retry-button" onClick={() => retry()}>
          Try again
        </button>
      </div>
    </>
  );
}
