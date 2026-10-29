"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { setBookmarked, setLiked } from "@/lib/actions/engagement";
import type { Engagement } from "@/types/api";

interface EngagementButtonsProps {
  slug: string;
  initial: Engagement;
  signedIn: boolean;
  loginUrl: string;
}

export type Change = { kind: "like"; on: boolean } | { kind: "bookmark"; on: boolean };

export function applyChange(state: Engagement, change: Change): Engagement {
  if (change.kind === "bookmark") return { ...state, bookmarked: change.on };
  if (state.liked === change.on) return state;
  return { ...state, liked: change.on, like_count: state.like_count + (change.on ? 1 : -1) };
}

/** Like and save buttons; the UI updates immediately and reconciles with the server. */
export function EngagementButtons({ slug, initial, signedIn, loginUrl }: EngagementButtonsProps) {
  const [state, setState] = useState(initial);
  const [optimistic, applyOptimistic] = useOptimistic(state, applyChange);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const toggle = (change: Change) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic(change);
      try {
        const action = change.kind === "like" ? setLiked : setBookmarked;
        setState(await action(slug, change.on));
      } catch {
        setError("Couldn't save that. Please try again.");
      }
    });
  };

  const likeLabel = `${optimistic.like_count} ${optimistic.like_count === 1 ? "like" : "likes"}`;

  if (!signedIn) {
    return (
      <div className="engagement">
        <Link href={loginUrl} className="engagement-button">
          <i className="fa-regular fa-heart" aria-hidden="true"></i> {likeLabel}
          <span className="sr-only"> (sign in to like)</span>
        </Link>
        <Link href={loginUrl} className="engagement-button">
          <i className="fa-regular fa-bookmark" aria-hidden="true"></i> Save
          <span className="sr-only"> (sign in to save)</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="engagement">
      <button
        type="button"
        className="engagement-button"
        aria-pressed={optimistic.liked}
        onClick={() => toggle({ kind: "like", on: !optimistic.liked })}
      >
        <i
          className={`fa-${optimistic.liked ? "solid" : "regular"} fa-heart`}
          aria-hidden="true"
        ></i>{" "}
        {likeLabel}
      </button>
      <button
        type="button"
        className="engagement-button"
        aria-pressed={optimistic.bookmarked}
        onClick={() => toggle({ kind: "bookmark", on: !optimistic.bookmarked })}
      >
        <i
          className={`fa-${optimistic.bookmarked ? "solid" : "regular"} fa-bookmark`}
          aria-hidden="true"
        ></i>{" "}
        {optimistic.bookmarked ? "Saved" : "Save"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
